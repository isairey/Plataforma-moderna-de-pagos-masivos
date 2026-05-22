#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, String, Symbol, Vec};

const MAX_BATCH_SIZE: u32 = 100;
/// #196: Cap the number of vesting schedules per recipient to prevent unbounded
/// iteration in claim() and revoke(), which would cause gas exhaustion (DoS).
const MAX_SCHEDULES_PER_RECIPIENT: u32 = 10;
const DAY_IN_LEDGERS: u32 = 17280;
const BUMP_THRESHOLD: u32 = 7 * DAY_IN_LEDGERS;
const BUMP_EXTEND_TO: u32 = 30 * DAY_IN_LEDGERS;

#[contract]
pub struct BatchVestingContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VestingData {
    pub amount: i128,
    pub unlock_time: u64,
    pub sender: Address,
    /// #194: Store the token address so claim/revoke can validate it matches
    /// the token that was originally deposited, preventing cross-token exploits.
    pub token: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RevokeRequest {
    pub recipient: Address,
    pub index: u32,
}

#[contracttype]
pub enum DataKey {
    VestingEntry(Address, u32), // (recipient, index) — granular per-schedule key
    VestingCount(Address),      // total number of schedules for a recipient
    Admin,
    PendingAdmin,
    Paused,
    /// #195: Permanent flag written on first set_admin and never cleared,
    /// even after renounce_admin.  Prevents admin re-claim post-renouncement.
    AdminInitialized,
    /// DEPRECATED: Old Vec<VestingData> storage key for backward compatibility
    Vesting(Address),
}

#[soroban_sdk::contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VestingError {
    Paused = 1,
    NotFound = 2,
    LengthMismatch = 3,
    InvalidUnlockTime = 4,
    InvalidAmount = 5,
    AdminAlreadySet = 6,
    NotAdmin = 7,
    AlreadyVested = 8,
    Unauthorized = 9,
    StillLocked = 10,
    /// #194: Provided token does not match the token stored in the vesting schedule.
    TokenMismatch = 11,
    /// #196: Recipient has reached the maximum number of allowed vesting schedules.
    ScheduleLimitExceeded = 12,
}

impl BatchVestingContract {
    fn panic_if_batch_too_large(batch_len: u32) {
        if batch_len > MAX_BATCH_SIZE {
            panic!("Batch size exceeds MAX_BATCH_SIZE");
        }
    }

    fn get_admin(env: &Env) -> Option<Address> {
        env.storage().persistent().get(&DataKey::Admin)
    }

    fn set_admin_internal(env: &Env, admin: &Address) {
        env.storage().persistent().set(&DataKey::Admin, admin);
    }

    fn remove_admin_internal(env: &Env) {
        env.storage().persistent().remove(&DataKey::Admin);
    }

    /// Returns true if set_admin was ever successfully called on this contract.
    fn is_admin_initialized(env: &Env) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::AdminInitialized)
            .unwrap_or(false)
    }

    /// Permanently records that admin has been initialised.  Never cleared.
    fn mark_admin_initialized(env: &Env) {
        env.storage()
            .persistent()
            .set(&DataKey::AdminInitialized, &true);
    }

    fn get_pending_admin(env: &Env) -> Option<Address> {
        env.storage().persistent().get(&DataKey::PendingAdmin)
    }

    fn set_pending_admin_internal(env: &Env, admin: &Address) {
        env.storage()
            .persistent()
            .set(&DataKey::PendingAdmin, admin);
    }

    fn remove_pending_admin_internal(env: &Env) {
        env.storage().persistent().remove(&DataKey::PendingAdmin);
    }

    fn require_current_admin(env: &Env, admin: &Address) {
        admin.require_auth();
        let stored_admin = Self::get_admin(env).expect("Admin must be set");
        if admin != &stored_admin {
            panic!("Only admin can perform this action");
        }
    }

    fn is_authorized(_env: &Env, caller: &Address, schedule_sender: &Address) -> bool {
        caller == schedule_sender
    }

    fn is_paused(env: &Env) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Paused)
            .unwrap_or(false)
    }

    fn panic_if_paused(env: &Env) {
        if Self::is_paused(env) {
            soroban_sdk::panic_with_error!(env, VestingError::Paused);
        }
    }

    /// Migrates old Vec<VestingData> to the new indexed mapping design on-the-fly.
    fn migrate_if_needed(env: &Env, recipient: &Address) {
        let old_key = DataKey::Vesting(recipient.clone());
        if let Some(old_vestings) = env
            .storage()
            .persistent()
            .get::<_, Vec<VestingData>>(&old_key)
        {
            let count = old_vestings.len();
            for i in 0..count {
                let vesting = old_vestings.get(i).unwrap();
                Self::set_vesting(env, recipient, i, &vesting);
            }
            Self::set_vesting_count(env, recipient, count);
            env.storage().persistent().remove(&old_key);
        }
    }

    /// Returns the current schedule count for a recipient.
    fn get_vesting_count(env: &Env, recipient: &Address) -> u32 {
        Self::migrate_if_needed(env, recipient);
        env.storage()
            .persistent()
            .get(&DataKey::VestingCount(recipient.clone()))
            .unwrap_or(0u32)
    }

    fn set_vesting_count(env: &Env, recipient: &Address, count: u32) {
        if count == 0 {
            env.storage()
                .persistent()
                .remove(&DataKey::VestingCount(recipient.clone()));
        } else {
            env.storage()
                .persistent()
                .set(&DataKey::VestingCount(recipient.clone()), &count);
            env.storage().persistent().extend_ttl(
                &DataKey::VestingCount(recipient.clone()),
                BUMP_THRESHOLD,
                BUMP_EXTEND_TO,
            );
        }
    }

    /// Appends a new vesting schedule for a recipient and returns its index.
    fn push_vesting(env: &Env, recipient: &Address, data: &VestingData) -> u32 {
        let idx = Self::get_vesting_count(env, recipient);
        Self::set_vesting(env, recipient, idx, data);
        Self::set_vesting_count(env, recipient, idx + 1);
        idx
    }

    /// Reads a single vesting schedule by index. Panics if missing.
    fn get_vesting(env: &Env, recipient: &Address, index: u32) -> VestingData {
        Self::migrate_if_needed(env, recipient);
        env.storage()
            .persistent()
            .get(&DataKey::VestingEntry(recipient.clone(), index))
            .unwrap_or_else(|| soroban_sdk::panic_with_error!(env, VestingError::NotFound))
    }

    fn set_vesting(env: &Env, recipient: &Address, index: u32, vesting: &VestingData) {
        env.storage()
            .persistent()
            .set(&DataKey::VestingEntry(recipient.clone(), index), vesting);
        env.storage().persistent().extend_ttl(
            &DataKey::VestingEntry(recipient.clone(), index),
            BUMP_THRESHOLD,
            BUMP_EXTEND_TO,
        );
    }

    /// Removes a schedule by swapping it with the last entry (O(1) removal).
    fn remove_vesting(env: &Env, recipient: &Address, index: u32) {
        let count = Self::get_vesting_count(env, recipient);
        if index >= count {
            return; // Or panic, handled upstream
        }

        let last = count - 1;
        if index != last {
            // Move last entry into the removed slot
            let last_data = Self::get_vesting(env, recipient, last);
            Self::set_vesting(env, recipient, index, &last_data);
        }

        env.storage()
            .persistent()
            .remove(&DataKey::VestingEntry(recipient.clone(), last));

        Self::set_vesting_count(env, recipient, last);
    }

    fn extend_ttl_admin(env: &Env) {
        if env.storage().persistent().has(&DataKey::Admin) {
            env.storage()
                .persistent()
                .extend_ttl(&DataKey::Admin, BUMP_THRESHOLD, BUMP_EXTEND_TO);
        }
        if env.storage().persistent().has(&DataKey::PendingAdmin) {
            env.storage().persistent().extend_ttl(
                &DataKey::PendingAdmin,
                BUMP_THRESHOLD,
                BUMP_EXTEND_TO,
            );
        }
        if env.storage().persistent().has(&DataKey::AdminInitialized) {
            env.storage().persistent().extend_ttl(
                &DataKey::AdminInitialized,
                BUMP_THRESHOLD,
                BUMP_EXTEND_TO,
            );
        }
    }

    fn extend_ttl_paused(env: &Env) {
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Paused, BUMP_THRESHOLD, BUMP_EXTEND_TO);
    }

    fn extend_ttl_vesting(env: &Env, recipient: &Address, idx: u32) {
        env.storage().persistent().extend_ttl(
            &DataKey::VestingEntry(recipient.clone(), idx),
            BUMP_THRESHOLD,
            BUMP_EXTEND_TO,
        );
        env.storage().persistent().extend_ttl(
            &DataKey::VestingCount(recipient.clone()),
            BUMP_THRESHOLD,
            BUMP_EXTEND_TO,
        );
    }
}

#[contractimpl]
impl BatchVestingContract {
    /// Initialize a batch of vestings.
    pub fn deposit(
        env: Env,
        sender: Address,
        token: Address,
        recipients: Vec<Address>,
        amounts: Vec<i128>,
        unlock_time: u64,
    ) {
        Self::panic_if_paused(&env);
        sender.require_auth();

        if recipients.len() != amounts.len() {
            soroban_sdk::panic_with_error!(&env, VestingError::LengthMismatch);
        }

        Self::panic_if_batch_too_large(recipients.len());

        if unlock_time <= env.ledger().timestamp() {
            soroban_sdk::panic_with_error!(&env, VestingError::InvalidUnlockTime);
        }

        let mut total_amount: i128 = 0;

        for i in 0..recipients.len() {
            let recipient = recipients.get(i).unwrap();
            let amount = amounts.get(i).unwrap();

            if amount <= 0 {
                soroban_sdk::panic_with_error!(&env, VestingError::InvalidAmount);
            }

            // #196: reject deposit if recipient is already at the schedule cap.
            let current_count = Self::get_vesting_count(&env, &recipient);
            if current_count >= MAX_SCHEDULES_PER_RECIPIENT {
                soroban_sdk::panic_with_error!(&env, VestingError::ScheduleLimitExceeded);
            }

            total_amount = total_amount.checked_add(amount).unwrap();

            let idx = Self::push_vesting(
                &env,
                &recipient,
                &VestingData {
                    amount,
                    unlock_time,
                    sender: sender.clone(),
                    token: token.clone(), // #194: bind token to this schedule
                },
            );
            Self::extend_ttl_vesting(&env, &recipient, idx);

            env.events().publish(
                (Symbol::new(&env, "VestingDeposited"), sender.clone(), recipient),
                (amount, unlock_time, token.clone()),
            );
        }

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&sender, &env.current_contract_address(), &total_amount);
    }

    /// Set admin for the contract. Only the very first call can set the admin.
    ///
    /// #195: Checks the permanent `AdminInitialized` flag rather than whether
    /// an admin is currently stored.  This prevents re-claiming admin rights
    /// after `renounce_admin` has been called.
    pub fn set_admin(env: Env, admin: Address) {
        admin.require_auth();
        if Self::is_admin_initialized(&env) {
            soroban_sdk::panic_with_error!(&env, VestingError::AdminAlreadySet);
        }
        Self::set_admin_internal(&env, &admin);
        Self::mark_admin_initialized(&env);
        Self::extend_ttl_admin(&env);
    }

    /// Propose a new admin. Only the current admin can nominate a successor.
    pub fn propose_admin(env: Env, admin: Address, new_admin: Address) {
        Self::panic_if_paused(&env);
        Self::require_current_admin(&env, &admin);
        Self::set_pending_admin_internal(&env, &new_admin);
        Self::extend_ttl_admin(&env);
        env.events().publish(
            (Symbol::new(&env, "AdminTransferProposed"),),
            (admin, new_admin),
        );
    }

    /// Accept a pending admin transfer.
    pub fn accept_admin(env: Env, new_admin: Address) {
        new_admin.require_auth();
        let pending_admin = Self::get_pending_admin(&env).expect("No admin transfer proposed");
        if new_admin != pending_admin {
            panic!("Only pending admin can accept transfer");
        }

        let previous_admin = Self::get_admin(&env).expect("Admin must be set");
        Self::set_admin_internal(&env, &new_admin);
        Self::remove_pending_admin_internal(&env);
        Self::extend_ttl_admin(&env);

        env.events().publish(
            (Symbol::new(&env, "AdminTransferred"),),
            (previous_admin, new_admin),
        );
    }

    /// Directly transfer admin to a new address. Requires authorization from the current admin.
    pub fn transfer_admin(env: Env, admin: Address, new_admin: Address) {
        Self::panic_if_paused(&env);
        Self::require_current_admin(&env, &admin);
        Self::set_admin_internal(&env, &new_admin);
        Self::remove_pending_admin_internal(&env);
        Self::extend_ttl_admin(&env);

        env.events()
            .publish((Symbol::new(&env, "AdminTransferred"),), (admin, new_admin));
    }

    /// Renounce admin rights and clear any in-flight transfer.
    pub fn renounce_admin(env: Env, admin: Address) {
        Self::panic_if_paused(&env);
        Self::require_current_admin(&env, &admin);
        Self::remove_admin_internal(&env);
        Self::remove_pending_admin_internal(&env);

        env.events()
            .publish((Symbol::new(&env, "AdminRenounced"),), admin);
    }

    /// Toggle contract pause state. Only admin can toggle pause.
    pub fn toggle_pause(env: Env, admin: Address, paused: bool) {
        Self::require_current_admin(&env, &admin);
        env.storage().persistent().set(&DataKey::Paused, &paused);
        Self::extend_ttl_paused(&env);

        env.events()
            .publish((Symbol::new(&env, "PauseToggled"),), (admin, paused));
    }

    /// Revoke an unvested schedule by index.
    pub fn revoke(env: Env, caller: Address, recipient: Address, index: u32) {
        Self::panic_if_paused(&env);
        caller.require_auth();

        let count = Self::get_vesting_count(&env, &recipient);
        if index >= count {
            soroban_sdk::panic_with_error!(&env, VestingError::NotFound);
        }

        let vesting = Self::get_vesting(&env, &recipient, index);
        let current_time = env.ledger().timestamp();
        let unlock_time = vesting.unlock_time;

        if current_time >= unlock_time {
            soroban_sdk::panic_with_error!(&env, VestingError::AlreadyVested);
        }

        if !Self::is_authorized(&env, &caller, &vesting.sender) {
            soroban_sdk::panic_with_error!(&env, VestingError::Unauthorized);
        }

        let token = vesting.token.clone();

        let revoked_amount = vesting.amount;
        let sender = vesting.sender.clone();

        Self::remove_vesting(&env, &recipient, index);

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &sender, &revoked_amount);

        env.events().publish(
            (Symbol::new(&env, "VestingRevoked"), recipient, sender),
            (revoked_amount, unlock_time, token),
        );
    }

    /// Revoke unvested schedules for multiple (recipient, index) pairs.
    ///
    /// Requests are processed in descending index order so that swap-with-last
    /// removal does not corrupt the indices of pending requests that target the
    /// same recipient (#198).
    pub fn batch_revoke(env: Env, caller: Address, requests: Vec<RevokeRequest>) -> Vec<bool> {
        Self::panic_if_paused(&env);
        caller.require_auth();
        Self::panic_if_batch_too_large(requests.len());

        let n = requests.len();
        if n == 0 {
            return Vec::new(&env);
        }

        let current_time = env.ledger().timestamp();

        // #198: Build a processing order sorted by request.index descending via
        // bubble sort (bounded by MAX_BATCH_SIZE = 100, so O(n²) is acceptable).
        // Processing higher indices first guarantees that the swap-with-last
        // removal of entry i never invalidates a later removal of entry j < i
        // for the same recipient.
        let mut process_order: Vec<u32> = Vec::new(&env);
        for k in 0..n {
            process_order.push_back(k);
        }
        for _pass in 0..n {
            for j in 0..(n - 1) {
                let a = process_order.get(j).unwrap();
                let b = process_order.get(j + 1).unwrap();
                let idx_a = requests.get(a).unwrap().index;
                let idx_b = requests.get(b).unwrap().index;
                if idx_a < idx_b {
                    process_order.set(j, b);
                    process_order.set(j + 1, a);
                }
            }
        }

        // Pre-allocate results in original request order (default false).
        let mut results: Vec<bool> = Vec::new(&env);
        for _ in 0..n {
            results.push_back(false);
        }

        for k in 0..n {
            let pos = process_order.get(k).unwrap();
            let request = requests.get(pos).unwrap();
            let recipient = &request.recipient;
            let index = request.index;

            let count = Self::get_vesting_count(&env, recipient);
            if index >= count {
                continue;
            }

            let vesting = Self::get_vesting(&env, recipient, index);

            if current_time >= vesting.unlock_time {
                continue;
            }

            if !Self::is_authorized(&env, &caller, &vesting.sender) {
                continue;
            }

            let token = vesting.token.clone();

            let revoked_amount = vesting.amount;
            let sender = vesting.sender.clone();
            let unlock_time = vesting.unlock_time;

            Self::remove_vesting(&env, recipient, index);

            let token_client = token::Client::new(&env, &token);
            token_client.transfer(&env.current_contract_address(), &sender, &revoked_amount);

            env.events().publish(
                (Symbol::new(&env, "VestingRevoked"), recipient.clone(), sender),
                (revoked_amount, unlock_time, token),
            );
            results.set(pos, true);
        }
        results
    }

    /// Return the contract version string.
    pub fn version(env: Env) -> String {
        String::from_str(&env, "1.0.0")
    }

    /// Claim all vested (unlocked) funds for the given recipient.
    ///
    /// All vested schedules are considered.
    pub fn claim(env: Env, recipient: Address) {
        Self::panic_if_paused(&env);
        recipient.require_auth();

        let count = Self::get_vesting_count(&env, &recipient);
        if count == 0 {
            soroban_sdk::panic_with_error!(&env, VestingError::NotFound);
        }

        let current_time = env.ledger().timestamp();

        // Collect claimable indices: unlocked.
        let mut claimable: Vec<u32> = Vec::new(&env);
        for i in 0..count {
            let vesting = Self::get_vesting(&env, &recipient, i);
            if current_time >= vesting.unlock_time {
                claimable.push_back(i);
            } else {
                Self::extend_ttl_vesting(&env, &recipient, i);
            }
        }

        if claimable.len() == 0 {
            soroban_sdk::panic_with_error!(&env, VestingError::StillLocked);
        }

        // Process claimable entries
        let claimable_len = claimable.len();
        for k in (0..claimable_len).rev() {
            let idx = claimable.get(k).unwrap();
            let current_count = Self::get_vesting_count(&env, &recipient);
            if idx < current_count {
                let vesting = Self::get_vesting(&env, &recipient, idx);
                let token_client = token::Client::new(&env, &vesting.token);
                token_client.transfer(&env.current_contract_address(), &recipient, &vesting.amount);

                Self::remove_vesting(&env, &recipient, idx);

                env.events().publish(
                    (Symbol::new(&env, "VestingClaimed"), recipient.clone()),
                    (vesting.amount, vesting.token.clone()),
                );
            }
        }
    }
    /// Bonus: Get paginated vesting schedules for a recipient
    pub fn get_vestings(env: Env, recipient: Address, start: u32, limit: u32) -> Vec<VestingData> {
        let count = Self::get_vesting_count(&env, &recipient);
        let mut result_vec = Vec::new(&env);

        if start >= count {
            return result_vec;
        }

        let end = core::cmp::min(start + limit, count);
        for i in start..end {
            result_vec.push_back(Self::get_vesting(&env, &recipient, i));
        }

        result_vec
    }
}
mod test;
