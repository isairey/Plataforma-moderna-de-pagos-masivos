#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Events, Ledger},
    token, Address, Env, IntoVal, String, Symbol, TryFromVal, TryIntoVal, Vec,
};
use token::Client as TokenClient;
use token::StellarAssetClient as TokenAdminClient;

fn create_token_contract<'a>(
    env: &Env,
    admin: &Address,
) -> (TokenClient<'a>, TokenAdminClient<'a>) {
    let contract_id = env.register_stellar_asset_contract(admin.clone());
    (
        TokenClient::new(env, &contract_id),
        TokenAdminClient::new(env, &contract_id),
    )
}

fn over_limit_recipients(env: &Env) -> Vec<Address> {
    let mut recipients = Vec::new(env);
    for _ in 0..(MAX_BATCH_SIZE + 1) {
        recipients.push_back(Address::generate(env));
    }
    recipients
}

fn matching_amounts(env: &Env, len: u32, amount: i128) -> Vec<i128> {
    let mut amounts = Vec::new(env);
    for _ in 0..len {
        amounts.push_back(amount);
    }
    amounts
}

#[test]
fn test_version() {
    let env = Env::default();
    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);
    assert_eq!(client.version(), String::from_str(&env, "1.0.0"));
}

#[test]
fn test_deposit_and_claim() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient1.clone(), recipient2.clone()]);
    let amounts = Vec::from_array(&env, [100, 200]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    assert_eq!(token.balance(&sender), 700);
    assert_eq!(token.balance(&contract_id), 300);

    env.ledger().with_mut(|li| {
        li.timestamp = 1001;
    });

    client.claim(&recipient1);
    assert_eq!(token.balance(&recipient1), 100);
    assert_eq!(token.balance(&contract_id), 200);

    client.claim(&recipient2);
    assert_eq!(token.balance(&recipient2), 200);
    assert_eq!(token.balance(&contract_id), 0);
}

#[test]
fn test_revoke_by_sender() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient.clone()]);
    let amounts = Vec::from_array(&env, [100]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });

    client.revoke(&sender, &recipient, &0);

    assert_eq!(token.balance(&sender), 1000);
    assert_eq!(token.balance(&contract_id), 0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_claim_after_revoke_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient.clone()]);
    let amounts = Vec::from_array(&env, [100]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);
    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });
    client.revoke(&sender, &recipient, &0);

    client.claim(&recipient);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #9)")]
fn test_revoke_by_admin_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let admin = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    client.set_admin(&admin);

    let recipients = Vec::from_array(&env, [recipient.clone()]);
    let amounts = Vec::from_array(&env, [100]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });
    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });

    client.revoke(&admin, &recipient, &0);

    assert_eq!(token.balance(&sender), 1000);
    assert_eq!(token.balance(&contract_id), 0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #9)")]
fn test_revoke_unauthorized() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let attacker = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient.clone()]);
    let amounts = Vec::from_array(&env, [100]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });

    client.revoke(&attacker, &recipient, &0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #8)")]
fn test_revoke_already_vested() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient.clone()]);
    let amounts = Vec::from_array(&env, [100]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    // Attempt revoke after unlock_time has passed — must fail with AlreadyVested (#8)
    client.revoke(&sender, &recipient, &0);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #10)")]
fn test_claim_too_early() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient1 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient1.clone()]);
    let amounts = Vec::from_array(&env, [100]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    // Try to claim before unlock_time
    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });

    client.claim(&recipient1);
}

#[test]
#[should_panic]
fn test_claim_unauthorized() {
    let env = Env::default();
    // NOT calling env.mock_all_auths() here
    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let recipient = Address::generate(&env);
    let _token = Address::generate(&env);

    // This should fail because recipient hasn't authorized the call
    client.claim(&recipient);
}

#[test]
#[should_panic(expected = "HostError: Error(Contract, #2)")]
fn test_claim_no_vesting() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let recipient = Address::generate(&env);
    let _token = Address::generate(&env);

    client.claim(&recipient);
}

#[test]
#[should_panic]
fn test_deposit_unauthorized() {
    let env = Env::default();
    // NOT calling env.mock_all_auths() here
    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let token = Address::generate(&env);
    let recipients = Vec::from_array(&env, [Address::generate(&env)]);
    let amounts = Vec::from_array(&env, [100]);
    let unlock_time = 1000;

    // This should fail because sender hasn't authorized the call
    client.deposit(&sender, &token, &recipients, &amounts, &unlock_time);
}

#[test]
#[should_panic(expected = "Batch size exceeds MAX_BATCH_SIZE")]
fn test_deposit_rejects_oversized_batch() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    let recipients = over_limit_recipients(&env);
    let amounts = matching_amounts(&env, recipients.len(), 1);
    let total_amount = i128::from(recipients.len());
    let unlock_time = 1000;

    token_admin_client.mint(&sender, &total_amount);

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);
}

#[test]
fn test_events_emission() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient1.clone(), recipient2.clone()]);
    let amounts = Vec::from_array(&env, [100, 200]);
    let unlock_time: u64 = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    // Verify VestingDeposited events
    let deposit_events = env.events().all();
    let deposit_symbol = Symbol::new(&env, "VestingDeposited");
    let mut deposit_found = 0;

    for (contract, topics, data) in deposit_events.iter() {
        if contract == contract_id && topics.len() == 3 {
            let topic: Symbol = topics.get(0).unwrap().into_val(&env);
            if topic == deposit_symbol {
                let evt_sender: Address = topics.get(1).unwrap().into_val(&env);
                let evt_recipient: Address = topics.get(2).unwrap().into_val(&env);
                let (evt_amount, evt_unlock, evt_token): (i128, u64, Address) = data.into_val(&env);
                assert_eq!(evt_sender, sender);
                assert_eq!(evt_unlock, unlock_time);
                assert_eq!(evt_token, token.address);
                if evt_recipient == recipient1 {
                    assert_eq!(evt_amount, 100);
                    deposit_found += 1;
                } else if evt_recipient == recipient2 {
                    assert_eq!(evt_amount, 200);
                    deposit_found += 1;
                }
            }
        }
    }
    assert_eq!(
        deposit_found, 2,
        "Should find 2 deposit events with correct data"
    );

    // Advance time and claim 1
    env.ledger().with_mut(|li| {
        li.timestamp = 1001;
    });

    client.claim(&recipient1);
    let claim1_events = env.events().all();
    let claim_symbol = Symbol::new(&env, "VestingClaimed");
    let mut claim1_found = false;

    for (contract, topics, data) in claim1_events.iter() {
        if contract == contract_id && topics.len() == 2 {
            let topic: Symbol = topics.get(0).unwrap().into_val(&env);
            if topic == claim_symbol {
                let evt_recipient: Address = topics.get(1).unwrap().into_val(&env);
                let (evt_amount, _evt_token): (i128, Address) = data.into_val(&env);
                assert_eq!(evt_recipient, recipient1);
                assert_eq!(evt_amount, 100);
                claim1_found = true;
            }
        }
    }
    assert!(claim1_found, "Should find claim event for recipient1");

    // Claim 2
    client.claim(&recipient2);
    let claim2_events = env.events().all();
    let mut claim2_found = false;

    for (contract, topics, data) in claim2_events.iter() {
        if contract == contract_id && topics.len() == 2 {
            let topic: Symbol = topics.get(0).unwrap().into_val(&env);
            if topic == claim_symbol {
                let evt_recipient: Address = topics.get(1).unwrap().into_val(&env);
                let (evt_amount, _evt_token): (i128, Address) = data.into_val(&env);
                assert_eq!(evt_recipient, recipient2);
                assert_eq!(evt_amount, 200);
                claim2_found = true;
            }
        }
    }
    assert!(claim2_found, "Should find claim event for recipient2");
}

#[test]
fn test_multiple_vestings_different_unlocks() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient.clone()]);

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    let amounts_first = Vec::from_array(&env, [100]);
    let unlock_time_first = 1000;
    client.deposit(
        &sender,
        &token.address,
        &recipients,
        &amounts_first,
        &unlock_time_first,
    );

    let amounts_second = Vec::from_array(&env, [300]);
    let unlock_time_second = 2000;
    client.deposit(
        &sender,
        &token.address,
        &recipients,
        &amounts_second,
        &unlock_time_second,
    );

    assert_eq!(token.balance(&sender), 600);
    assert_eq!(token.balance(&contract_id), 400);

    // First vesting should be claimable without affecting the later one.
    env.ledger().with_mut(|li| {
        li.timestamp = 1001;
    });

    client.claim(&recipient);
    assert_eq!(token.balance(&recipient), 100);
    assert_eq!(token.balance(&contract_id), 300);

    // Second vesting unlocks later.
    env.ledger().with_mut(|li| {
        li.timestamp = 2001;
    });

    client.claim(&recipient);
    assert_eq!(token.balance(&recipient), 400);
    assert_eq!(token.balance(&contract_id), 0);
}

#[test]
fn test_batch_revoke_by_sender() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let recipient3 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(
        &env,
        [recipient1.clone(), recipient2.clone(), recipient3.clone()],
    );
    let amounts = Vec::from_array(&env, [100, 200, 300]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    assert_eq!(token.balance(&sender), 400);
    assert_eq!(token.balance(&contract_id), 600);

    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });

    let revoke_requests = Vec::from_array(
        &env,
        [
            RevokeRequest {
                recipient: recipient1.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient2.clone(),
                index: 0,
            },
        ],
    );
    let results = client.batch_revoke(&sender, &revoke_requests);

    assert_eq!(results.get(0).unwrap(), true);
    assert_eq!(results.get(1).unwrap(), true);
    assert_eq!(token.balance(&sender), 700);
    assert_eq!(token.balance(&contract_id), 300);
}

#[test]
fn test_batch_revoke_by_admin_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let admin = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    client.set_admin(&admin);

    let recipients = Vec::from_array(&env, [recipient1.clone(), recipient2.clone()]);
    let amounts = Vec::from_array(&env, [150, 250]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });
    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });

    let revoke_requests = Vec::from_array(
        &env,
        [
            RevokeRequest {
                recipient: recipient1.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient2.clone(),
                index: 0,
            },
        ],
    );
    let results = client.batch_revoke(&admin, &revoke_requests);
    // Admin cannot revoke, so results should be false
    assert_eq!(results.get(0).unwrap(), false);
    assert_eq!(results.get(1).unwrap(), false);
    assert_eq!(token.balance(&sender), 600); // sender spent 400 on deposit
    assert_eq!(token.balance(&admin), 0); // admin got nothing
    assert_eq!(token.balance(&contract_id), 400); // funds remain locked
}

#[test]
fn test_batch_revoke_multiple_senders_fails_for_admin() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender1 = Address::generate(&env);
    let sender2 = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let admin = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);

    token_admin_client.mint(&sender1, &1000);
    token_admin_client.mint(&sender2, &1000);

    client.set_admin(&admin);

    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    // Sender 1 deposits for Recipient 1
    client.deposit(
        &sender1,
        &token.address,
        &Vec::from_array(&env, [recipient1.clone()]),
        &Vec::from_array(&env, [100]),
        &unlock_time,
    );

    // Sender 2 deposits for Recipient 2
    client.deposit(
        &sender2,
        &token.address,
        &Vec::from_array(&env, [recipient2.clone()]),
        &Vec::from_array(&env, [200]),
        &unlock_time,
    );

    assert_eq!(token.balance(&sender1), 900);
    assert_eq!(token.balance(&sender2), 800);
    assert_eq!(token.balance(&contract_id), 300);

    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });

    // Admin revokes both in a batch
    let revoke_requests = Vec::from_array(
        &env,
        [
            RevokeRequest {
                recipient: recipient1.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient2.clone(),
                index: 0,
            },
        ],
    );
    let results = client.batch_revoke(&admin, &revoke_requests);

    // Admin revokes should fail
    assert_eq!(results.get(0).unwrap(), false);
    assert_eq!(results.get(1).unwrap(), false);
    assert_eq!(token.balance(&sender1), 900); // unchanged
    assert_eq!(token.balance(&sender2), 800); // unchanged
    assert_eq!(token.balance(&admin), 0);
    assert_eq!(token.balance(&contract_id), 300); // funds remain locked
}

#[test]
fn test_batch_revoke_unauthorized() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let attacker = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient1.clone(), recipient2.clone()]);
    let amounts = Vec::from_array(&env, [100, 200]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });

    let revoke_requests = Vec::from_array(
        &env,
        [
            RevokeRequest {
                recipient: recipient1.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient2.clone(),
                index: 0,
            },
        ],
    );
    // Attacker is not sender or admin, so both entries fail
    let results = client.batch_revoke(&attacker, &revoke_requests);
    assert_eq!(
        results.get(0).unwrap(),
        false,
        "Unauthorized attacker should fail for recipient1"
    );
    assert_eq!(
        results.get(1).unwrap(),
        false,
        "Unauthorized attacker should fail for recipient2"
    );
    // Funds remain untouched
    assert_eq!(token.balance(&contract_id), 300);
}

#[test]
fn test_batch_revoke_already_vested() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient1.clone(), recipient2.clone()]);
    let amounts = Vec::from_array(&env, [100, 200]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    // Advance past unlock_time — both schedules are already vested
    env.ledger().with_mut(|li| {
        li.timestamp = 1000;
    });

    let revoke_requests = Vec::from_array(
        &env,
        [
            RevokeRequest {
                recipient: recipient1.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient2.clone(),
                index: 0,
            },
        ],
    );
    let results = client.batch_revoke(&sender, &revoke_requests);
    assert_eq!(
        results.get(0).unwrap(),
        false,
        "Already-vested entry should return false"
    );
    assert_eq!(
        results.get(1).unwrap(),
        false,
        "Already-vested entry should return false"
    );
    // Funds are still in contract, not revoked
    assert_eq!(token.balance(&contract_id), 300);
}

#[test]
fn test_batch_revoke_no_vesting() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (_token, _) = create_token_contract(&env, &token_admin);

    let revoke_requests = Vec::from_array(
        &env,
        [
            RevokeRequest {
                recipient: recipient1.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient2.clone(),
                index: 0,
            },
        ],
    );

    // Neither recipient has any vesting — both should return false
    let results = client.batch_revoke(&sender, &revoke_requests);
    assert_eq!(
        results.get(0).unwrap(),
        false,
        "No-vesting entry should return false"
    );
    assert_eq!(
        results.get(1).unwrap(),
        false,
        "No-vesting entry should return false"
    );
}

#[test]
fn test_batch_revoke_events_emission() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient1.clone(), recipient2.clone()]);
    let amounts = Vec::from_array(&env, [100, 200]);
    let unlock_time: u64 = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });

    let revoke_requests = Vec::from_array(
        &env,
        [
            RevokeRequest {
                recipient: recipient1.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient2.clone(),
                index: 0,
            },
        ],
    );
    let results = client.batch_revoke(&sender, &revoke_requests);
    assert_eq!(results.get(0).unwrap(), true);
    assert_eq!(results.get(1).unwrap(), true);

    let revoke_events = env.events().all();
    let revoke_symbol = Symbol::new(&env, "VestingRevoked");
    let mut revoke_found = 0;

    for (contract, topics, data) in revoke_events.iter() {
        if contract == contract_id && topics.len() == 3 {
            let topic: Symbol = topics.get(0).unwrap().into_val(&env);
            if topic == revoke_symbol {
                let evt_recipient: Address = topics.get(1).unwrap().into_val(&env);
                let evt_sender: Address = topics.get(2).unwrap().into_val(&env);
                let (evt_amount, evt_unlock, evt_token): (i128, u64, Address) = data.into_val(&env);
                assert_eq!(evt_sender, sender);
                assert_eq!(evt_unlock, unlock_time);
                assert_eq!(evt_token, token.address);
                if evt_recipient == recipient1 {
                    assert_eq!(evt_amount, 100);
                    revoke_found += 1;
                } else if evt_recipient == recipient2 {
                    assert_eq!(evt_amount, 200);
                    revoke_found += 1;
                }
            }
        }
    }
    assert_eq!(
        revoke_found, 2,
        "Should find 2 revoke events with correct data"
    );
}

#[test]
fn test_batch_revoke_partial_recipients() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient1 = Address::generate(&env);
    let recipient2 = Address::generate(&env);
    let recipient3 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(
        &env,
        [recipient1.clone(), recipient2.clone(), recipient3.clone()],
    );
    let amounts = Vec::from_array(&env, [100, 200, 300]);
    let unlock_time = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    env.ledger().with_mut(|li| {
        li.timestamp = 500;
    });

    let revoke_requests = Vec::from_array(
        &env,
        [RevokeRequest {
            recipient: recipient1.clone(),
            index: 0,
        }],
    );
    let results = client.batch_revoke(&sender, &revoke_requests);
    assert_eq!(results.get(0).unwrap(), true);

    assert_eq!(token.balance(&sender), 500);
    assert_eq!(token.balance(&contract_id), 500);

    env.ledger().with_mut(|li| {
        li.timestamp = 1001;
    });

    client.claim(&recipient2);
    assert_eq!(token.balance(&recipient2), 200);

    client.claim(&recipient3);
    assert_eq!(token.balance(&recipient3), 300);
}

#[test]
#[should_panic(expected = "Batch size exceeds MAX_BATCH_SIZE")]
fn test_batch_revoke_rejects_oversized_batch() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (_token, _) = create_token_contract(&env, &token_admin);

    // Build an over-limit Vec<RevokeRequest>
    let mut requests: Vec<RevokeRequest> = Vec::new(&env);
    for _ in 0..(MAX_BATCH_SIZE + 1) {
        requests.push_back(RevokeRequest {
            recipient: Address::generate(&env),
            index: 0,
        });
    }

    client.batch_revoke(&sender, &requests);
}

#[test]
fn test_batch_revoke_partial_success() {
    // Mixed batch: valid, no-vesting, already-vested, unauthorized
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let attacker = Address::generate(&env);
    let recipient_valid = Address::generate(&env); // will succeed
    let recipient_novesting = Address::generate(&env); // has no vesting at all
    let recipient_vested = Address::generate(&env); // already vested
    let recipient_unauth = Address::generate(&env); // vesting owned by different sender

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);
    token_admin_client.mint(&attacker, &500);

    let unlock_time: u64 = 1000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    // Deposit for the valid recipient
    client.deposit(
        &sender,
        &token.address,
        &Vec::from_array(&env, [recipient_valid.clone()]),
        &Vec::from_array(&env, [100i128]),
        &unlock_time,
    );

    // Deposit for the already-vested recipient
    client.deposit(
        &sender,
        &token.address,
        &Vec::from_array(&env, [recipient_vested.clone()]),
        &Vec::from_array(&env, [200i128]),
        &unlock_time,
    );

    // Deposit for the unauthorised recipient (owned by attacker, not sender)
    client.deposit(
        &attacker,
        &token.address,
        &Vec::from_array(&env, [recipient_unauth.clone()]),
        &Vec::from_array(&env, [300i128]),
        &unlock_time,
    );

    // Advance time past unlock_time for recipient_vested
    env.ledger().with_mut(|li| {
        li.timestamp = 1000; // already vested
    });

    let revoke_requests = Vec::from_array(
        &env,
        [
            RevokeRequest {
                recipient: recipient_valid.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient_novesting.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient_vested.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient_unauth.clone(),
                index: 0,
            },
        ],
    );

    // sender is not the vesting owner for recipient_unauth (attacker is)
    let results = client.batch_revoke(&sender, &revoke_requests);

    assert_eq!(results.len(), 4);
    assert_eq!(
        results.get(0).unwrap(),
        false,
        "recipient_valid: timestamp == unlock_time so already vested"
    );
    assert_eq!(
        results.get(1).unwrap(),
        false,
        "recipient_novesting: no schedule exists"
    );
    assert_eq!(
        results.get(2).unwrap(),
        false,
        "recipient_vested: already past unlock"
    );
    assert_eq!(
        results.get(3).unwrap(),
        false,
        "recipient_unauth: sender not authorized"
    );

    // Confirm no funds were moved
    assert_eq!(token.balance(&sender), 700);
    assert_eq!(token.balance(&contract_id), 600);
}

#[test]
fn test_batch_revoke_mixed_valid_and_invalid() {
    // Some entries succeed, some fail — valid ones must still be processed
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient_valid1 = Address::generate(&env);
    let recipient_novesting = Address::generate(&env);
    let recipient_valid2 = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let unlock_time: u64 = 2000;

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    // Deposit for valid1 and valid2 only; novesting has nothing
    client.deposit(
        &sender,
        &token.address,
        &Vec::from_array(&env, [recipient_valid1.clone(), recipient_valid2.clone()]),
        &Vec::from_array(&env, [150i128, 250i128]),
        &unlock_time,
    );

    env.ledger().with_mut(|li| {
        li.timestamp = 500; // still locked
    });

    let revoke_requests = Vec::from_array(
        &env,
        [
            RevokeRequest {
                recipient: recipient_valid1.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient_novesting.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient_valid2.clone(),
                index: 0,
            },
        ],
    );

    let results = client.batch_revoke(&sender, &revoke_requests);

    assert_eq!(results.len(), 3);
    assert_eq!(
        results.get(0).unwrap(),
        true,
        "recipient_valid1 should succeed"
    );
    assert_eq!(
        results.get(1).unwrap(),
        false,
        "recipient_novesting has no schedule"
    );
    assert_eq!(
        results.get(2).unwrap(),
        true,
        "recipient_valid2 should succeed"
    );

    // valid1 (150) and valid2 (250) returned to sender
    assert_eq!(token.balance(&sender), 1000);
    assert_eq!(token.balance(&contract_id), 0);
}

// ─── Issue #195: Admin re-claim after renouncement ───────────────────────────

/// After renounce_admin, set_admin must be permanently blocked so no one can
/// take over admin rights on a contract that intentionally renounced them.
#[test]
#[should_panic(expected = "HostError: Error(Contract, #6)")]
fn test_set_admin_after_renounce_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let attacker = Address::generate(&env);

    // Legitimate first-time admin initialisation
    client.set_admin(&admin);

    // Admin renounces ownership
    client.renounce_admin(&admin);

    // Attacker (or anyone else) must NOT be able to claim admin — must panic
    // with AdminAlreadySet (#6).
    client.set_admin(&attacker);
}

/// Calling set_admin a second time while an admin is still active must also
/// fail (existing behaviour preserved).
#[test]
#[should_panic(expected = "HostError: Error(Contract, #6)")]
fn test_set_admin_twice_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let admin1 = Address::generate(&env);
    let admin2 = Address::generate(&env);

    client.set_admin(&admin1);
    // Second call must fail with AdminAlreadySet (#6)
    client.set_admin(&admin2);
}

// ─── Tests for updated claim behavior ───────────────────────────────────────

/// Verify that claim() retrieves funds for multiple tokens.
#[test]
fn test_claim_multi_token() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let (token_a, token_admin_a) = create_token_contract(&env, &Address::generate(&env));
    let (token_b, token_admin_b) = create_token_contract(&env, &Address::generate(&env));

    token_admin_a.mint(&sender, &1000);
    token_admin_b.mint(&sender, &1000);

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    client.deposit(
        &sender,
        &token_a.address,
        &Vec::from_array(&env, [recipient.clone()]),
        &Vec::from_array(&env, [100]),
        &1000,
    );
    client.deposit(
        &sender,
        &token_b.address,
        &Vec::from_array(&env, [recipient.clone()]),
        &Vec::from_array(&env, [200]),
        &1000,
    );

    env.ledger().with_mut(|li| {
        li.timestamp = 1001;
    });

    client.claim(&recipient);

    assert_eq!(token_a.balance(&recipient), 100);
    assert_eq!(token_b.balance(&recipient), 200);
    assert_eq!(token_a.balance(&contract_id), 0);
    assert_eq!(token_b.balance(&contract_id), 0);
}

// (Tests removed as revoke no longer takes a token argument)

// ─── Issue #196: Per-recipient schedule cap ──────────────────────────────────

/// deposit must reject when a recipient already holds MAX_SCHEDULES_PER_RECIPIENT schedules.
#[test]
#[should_panic(expected = "HostError: Error(Contract, #12)")]
fn test_deposit_schedule_limit_exceeded() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &10000);

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    // Fill up to the limit: each deposit adds one schedule for the same recipient.
    for i in 0..MAX_SCHEDULES_PER_RECIPIENT {
        let unlock = 1000 + u64::from(i) * 100;
        client.deposit(
            &sender,
            &token.address,
            &Vec::from_array(&env, [recipient.clone()]),
            &Vec::from_array(&env, [10i128]),
            &unlock,
        );
    }

    // One more deposit for the same recipient must panic with ScheduleLimitExceeded (#12).
    client.deposit(
        &sender,
        &token.address,
        &Vec::from_array(&env, [recipient.clone()]),
        &Vec::from_array(&env, [10i128]),
        &(2000 + u64::from(MAX_SCHEDULES_PER_RECIPIENT) * 100),
    );
}

// ─── Issue #198: batch_revoke processes all matching schedules per recipient ──

/// When a recipient has multiple schedules and all are included in a single
/// batch_revoke call, every schedule must be revoked (not just the first).
/// This also validates that descending-index processing prevents swap-remove
/// index corruption.
#[test]
fn test_batch_revoke_multiple_schedules_same_recipient() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &10000);

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    // Create 3 separate vesting schedules for the same recipient
    // (different unlock times so each deposit call is valid)
    client.deposit(
        &sender,
        &token.address,
        &Vec::from_array(&env, [recipient.clone()]),
        &Vec::from_array(&env, [100i128]),
        &1000u64,
    );
    client.deposit(
        &sender,
        &token.address,
        &Vec::from_array(&env, [recipient.clone()]),
        &Vec::from_array(&env, [200i128]),
        &2000u64,
    );
    client.deposit(
        &sender,
        &token.address,
        &Vec::from_array(&env, [recipient.clone()]),
        &Vec::from_array(&env, [300i128]),
        &3000u64,
    );

    // Recipient has 3 schedules (indices 0, 1, 2); contract holds 600 tokens.
    assert_eq!(token.balance(&contract_id), 600);

    env.ledger().with_mut(|li| {
        li.timestamp = 500; // all three are still locked
    });

    // Revoke all three in one batch call — higher indices must be processed first
    // internally to avoid swap-remove corruption.
    let revoke_requests = Vec::from_array(
        &env,
        [
            RevokeRequest {
                recipient: recipient.clone(),
                index: 0,
            },
            RevokeRequest {
                recipient: recipient.clone(),
                index: 1,
            },
            RevokeRequest {
                recipient: recipient.clone(),
                index: 2,
            },
        ],
    );
    let results = client.batch_revoke(&sender, &revoke_requests);

    // All three must succeed
    assert_eq!(
        results.get(0).unwrap(),
        true,
        "schedule at index 0 must be revoked"
    );
    assert_eq!(
        results.get(1).unwrap(),
        true,
        "schedule at index 1 must be revoked"
    );
    assert_eq!(
        results.get(2).unwrap(),
        true,
        "schedule at index 2 must be revoked"
    );

    // All 600 tokens returned to sender; contract is empty.
    assert_eq!(token.balance(&sender), 10000);
    assert_eq!(token.balance(&contract_id), 0);
}

#[test]
fn test_lazy_migration() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let recipient = Address::generate(&env);
    let sender = Address::generate(&env);
    let token = Address::generate(&env);

    // Manually inject older Vec<VestingData> storage using Env's as_contract
    let old_data = Vec::from_array(
        &env,
        [
            VestingData {
                amount: 100,
                unlock_time: 1000,
                sender: sender.clone(),
                token: token.clone(),
            },
            VestingData {
                amount: 200,
                unlock_time: 2000,
                sender: sender.clone(),
                token: token.clone(),
            },
        ],
    );

    env.as_contract(&contract_id, || {
        env.storage()
            .persistent()
            .set(&DataKey::Vesting(recipient.clone()), &old_data);
    });

    // Calling get_vestings should trigger the lazy migration and return the two elements
    let vestings = client.get_vestings(&recipient, &0, &10);
    assert_eq!(vestings.len(), 2);
    assert_eq!(vestings.get(0).unwrap().amount, 100);
    assert_eq!(vestings.get(1).unwrap().amount, 200);

    // After migration, the old key should be deleted and the new individual entry keys exist.
    env.as_contract(&contract_id, || {
        assert_eq!(
            env.storage()
                .persistent()
                .has(&DataKey::Vesting(recipient.clone())),
            false
        );
        assert_eq!(
            env.storage()
                .persistent()
                .get::<_, u32>(&DataKey::VestingCount(recipient.clone()))
                .unwrap(),
            2
        );
    });
}

#[test]
fn test_get_vestings_pagination() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &10000);

    env.ledger().with_mut(|li| {
        li.timestamp = 0;
    });

    for i in 0..5 {
        client.deposit(
            &sender,
            &token.address,
            &Vec::from_array(&env, [recipient.clone()]),
            &Vec::from_array(&env, [10i128]),
            &(1000 + i * 100),
        );
    }

    // start=0, limit=2 => returns 2 elements
    let page1 = client.get_vestings(&recipient, &0, &2);
    assert_eq!(page1.len(), 2);

    // start=2, limit=2 => returns 2 elements
    let page2 = client.get_vestings(&recipient, &2, &2);
    assert_eq!(page2.len(), 2);

    // start=4, limit=2 => returns 1 element (only 1 left)
    let page3 = client.get_vestings(&recipient, &4, &2);
    assert_eq!(page3.len(), 1);

    // start=5, limit=2 => returns 0 elements (out of bounds)
    let page4 = client.get_vestings(&recipient, &5, &2);
    assert_eq!(page4.len(), 0);
}

// ── #197: Event payload includes token address ──────────────────────────────

/// Helper: find the last event matching a topic symbol and deserialize its data.
fn find_event_data<T: soroban_sdk::TryFromVal<Env, soroban_sdk::Val>>(
    env: &Env,
    event_name: &str,
) -> T {
    let events = env.events().all();
    let target = Symbol::new(env, event_name);
    for i in (0..events.len()).rev() {
        let (_, topics, data) = events.get(i).unwrap();
        if topics.len() >= 1 {
            let first_val = topics.get(0).unwrap();
            let first_sym: Result<Symbol, _> = first_val.try_into_val(env);
            if let Ok(sym) = first_sym {
                if sym == target {
                    return data.try_into_val(env).unwrap();
                }
            }
        }
    }
    panic!("Event '{}' not found", event_name);
}

#[test]
fn test_deposit_event_includes_token_address() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient.clone()]);
    let amounts = Vec::from_array(&env, [100i128]);
    let unlock_time = 1000u64;

    env.ledger().with_mut(|li| li.timestamp = 0);
    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    let payload: (i128, u64, Address) = find_event_data(&env, "VestingDeposited");
    assert_eq!(payload.0, 100i128, "amount mismatch");
    assert_eq!(payload.1, 1000u64, "unlock_time mismatch");
    assert_eq!(payload.2, token.address, "token address missing from deposit event");
}

#[test]
fn test_claim_event_includes_token_address() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient.clone()]);
    let amounts = Vec::from_array(&env, [100i128]);
    let unlock_time = 1000u64;

    env.ledger().with_mut(|li| li.timestamp = 0);
    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    env.ledger().with_mut(|li| li.timestamp = 1001);
    client.claim(&recipient);

    let payload: (i128, Address) = find_event_data(&env, "VestingClaimed");
    assert_eq!(payload.0, 100i128, "amount mismatch");
    assert_eq!(payload.1, token.address, "token address missing from claim event");
}

#[test]
fn test_revoke_event_includes_token_address() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, BatchVestingContract);
    let client = BatchVestingContractClient::new(&env, &contract_id);

    let sender = Address::generate(&env);
    let recipient = Address::generate(&env);
    let token_admin = Address::generate(&env);
    let (token, token_admin_client) = create_token_contract(&env, &token_admin);
    token_admin_client.mint(&sender, &1000);

    let recipients = Vec::from_array(&env, [recipient.clone()]);
    let amounts = Vec::from_array(&env, [100i128]);
    let unlock_time = 1000u64;

    env.ledger().with_mut(|li| li.timestamp = 0);
    client.deposit(&sender, &token.address, &recipients, &amounts, &unlock_time);

    env.ledger().with_mut(|li| li.timestamp = 500);
    client.revoke(&sender, &recipient, &0);

    let payload: (i128, u64, Address) = find_event_data(&env, "VestingRevoked");
    assert_eq!(payload.0, 100i128, "amount mismatch");
    assert_eq!(payload.1, 1000u64, "unlock_time mismatch");
    assert_eq!(payload.2, token.address, "token address missing from revoke event");
}
