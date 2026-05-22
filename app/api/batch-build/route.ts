/**
 * API route for building unsigned batch payment transactions.
 *
 * POST /api/batch-build
 *
 * Accepts { payments, network, publicKey } and returns an array of
 * unsigned transaction XDRs ready for client-side signing (e.g., Freighter).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  TransactionBuilder,
  Networks,
  Asset as StellarAsset,
  Operation,
  Horizon,
  Memo,
  StrKey,
} from "stellar-sdk";
import { safeJsonResponse } from "@/lib/safe-json";

import { createBatches, parseAsset } from "@/lib/stellar/batcher";
import {
  validatePaymentInstruction,
  validatePaymentInstructions,
  buildBalancesMap,
  validateBalances,
} from "@/lib/stellar/validator";
import type { PaymentInstruction } from "@/lib/stellar/types";
import { getRecommendedFee } from "@/lib/stellar/fee-service";

interface RequestBody {
  payments: PaymentInstruction[];
  network: "testnet" | "mainnet";
  publicKey: string;
}

const MAX_OPS = 100;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { payments, network, publicKey } = body;

    // ── Validate inputs ──────────────────────────────────────────
    if (!publicKey || typeof publicKey !== "string") {
      return NextResponse.json(
        { error: "publicKey is required" },
        { status: 400 }
      );
    }

    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
      return NextResponse.json(
        { error: "Invalid Stellar public key checksum" },
        { status: 400 }
      );
    }

    if (!Array.isArray(payments) || payments.length === 0) {
      return NextResponse.json(
        { error: "payments must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!["testnet", "mainnet"].includes(network)) {
      return NextResponse.json(
        { error: "network must be 'testnet' or 'mainnet'" },
        { status: 400 }
      );
    }

    const validation = validatePaymentInstructions(payments);
    if (!validation.valid) {
      const errors = Array.from(validation.errors.entries())
        .map(([idx, err]) => `Row ${idx + 1}: ${err}`)
        .slice(0, 5);
      return NextResponse.json(
        { error: `Invalid payment instructions: ${errors.join("; ")}` },
        { status: 400 }
      );
    }

    // ── Build unsigned XDRs ──────────────────────────────────────
    const serverUrl =
      network === "testnet"
        ? "https://horizon-testnet.stellar.org"
        : "https://horizon.stellar.org";
    const server = new Horizon.Server(serverUrl);

    const sourceAccount = await server.loadAccount(publicKey);

    // Validate source account has sufficient balance for all assets
    const balancesMap = buildBalancesMap(
      sourceAccount.balances as { asset_type: string; asset_code?: string; asset_issuer?: string; balance: string }[],
    );
    const balanceCheck = validateBalances(payments, balancesMap);
    if (!balanceCheck.all_sufficient) {
      const insufficient = balanceCheck.checks
        .filter((c) => !c.sufficient)
        .map((c) => `${c.asset_key}: need ${c.required}, have ${c.available}`)
        .join("; ");
      return NextResponse.json(
        { error: `Insufficient balance: ${insufficient}` },
        { status: 400 },
      );
    }

    // Await the batches properly (was causing 'length' error)
    const batches = await createBatches(payments, MAX_OPS, { network });

    const networkPassphrase =
      network === "testnet" ? Networks.TESTNET : Networks.PUBLIC;

    // Fetch dynamic fee from Horizon using fee service
    const dynamicFee = await getRecommendedFee(server);

    const xdrs: string[] = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      // Use user-provided memo from the first payment that has one,
      // otherwise fall back to the system-generated tracking memo.
      // Stellar supports only one memo per transaction.
      const firstMemoPayment = batch.payments.find(p => p.memo);
      let memo: ReturnType<typeof Memo.text>;
      if (firstMemoPayment?.memo) {
        const memoType = firstMemoPayment.memoType ?? 'text';
        memo = memoType === 'id'
          ? Memo.id(firstMemoPayment.memo)
          : Memo.text(firstMemoPayment.memo);
      } else {
        const memoId = `bp-${Date.now()}-${i}`;
        memo = Memo.text(memoId.slice(0, 28));
      }

      let builder = new TransactionBuilder(sourceAccount, {
        fee: String(dynamicFee),
        networkPassphrase,
      }).addMemo(memo);

      for (const payment of batch.payments) {
        const pv = validatePaymentInstruction(payment);
        if (!pv.valid) continue;

        const asset = parseAsset(payment.asset);
        const stellarAsset =
          asset.issuer === null
            ? StellarAsset.native()
            : new StellarAsset(asset.code, asset.issuer);

        builder = builder.addOperation(
          Operation.payment({
            destination: payment.address,
            asset: stellarAsset,
            amount: payment.amount,
          })
        );
      }

      const transaction = builder.setTimeout(300).build();
      xdrs.push(transaction.toXDR());

      // Increment sequence number for next transaction
      sourceAccount.incrementSequenceNumber();
    }

    return safeJsonResponse({
      xdrs,
      batchCount: batches.length,
      network,
      publicKey,
    });
  } catch (error) {
    console.error("Batch build error:", error);
    return safeJsonResponse(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
