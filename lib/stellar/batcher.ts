/**
 * Batching logic for chunking payments into multiple transactions
 */

import {
  Account,
  Asset as StellarAsset,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
  Horizon,
} from 'stellar-sdk';
import Big from 'big.js';

import { PaymentInstruction, Asset } from './types';
import { getRecommendedFee } from './fee-service';

export interface Batch {
  transactionIndex: number;
  payments: PaymentInstruction[];
}

export interface CreateBatchesOptions {
  maxTransactionBytes?: number;
  network?: 'testnet' | 'mainnet';
  server?: Horizon.Server;
}

export const STELLAR_TRANSACTION_SIZE_LIMIT_BYTES = 100_000;
const DEFAULT_TRANSACTION_SIZE_HEADROOM_BYTES = 95_000;
const SIZE_ESTIMATION_ACCOUNT = new Account(
  'GANQYDFSSJMTNLITJNXUPRUIFDVZQK2P4HWSX5CAI4SPIYPXNNFOPZQE',
  '1',
);

function getTransactionByteLength(xdr: string | Buffer): number {
  if (typeof xdr !== 'string') {
    return xdr.length;
  }

  return Buffer.from(xdr, 'base64').length;
}

export function estimateBatchTransactionSize(
  payments: PaymentInstruction[],
  network: 'testnet' | 'mainnet' = 'testnet',
  fee?: number,
): number {
  const networkPassphrase =
    network === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET;

  // Use provided fee or default to 100 stroops (minimum fee)
  const feeToUse = fee !== undefined ? fee : 100;

  let builder = new TransactionBuilder(SIZE_ESTIMATION_ACCOUNT, {
    fee: String(feeToUse),
    networkPassphrase,
  }).addMemo(Memo.text('batch-size-check'));

  for (const payment of payments) {
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
      }),
    );
  }

  const transaction = builder.setTimeout(300).build();
  return getTransactionByteLength(transaction.toEnvelope().toXDR());
}

/**
 * Split payment instructions into batches based on max operations per transaction
 */
export async function createBatches(
  instructions: PaymentInstruction[],
  maxOperationsPerTransaction: number,
  options: CreateBatchesOptions = {},
): Promise<Batch[]> {
  const batches: Batch[] = [];
  let currentBatch: PaymentInstruction[] = [];
  let transactionIndex = 0;
  const maxTransactionBytes =
    options.maxTransactionBytes ?? DEFAULT_TRANSACTION_SIZE_HEADROOM_BYTES;
  const network = options.network ?? 'testnet';

  // Fetch dynamic fee for size estimation
  let dynamicFee: number | undefined;
  if (options.server) {
    try {
      dynamicFee = await getRecommendedFee(options.server);
    } catch (error) {
      console.warn('Failed to fetch dynamic fee for size estimation, using default:', error);
    }
  }

  for (const instruction of instructions) {
    const candidateBatch = [...currentBatch, instruction];
    const exceedsOperationLimit =
      candidateBatch.length > maxOperationsPerTransaction;
    const exceedsSizeLimit =
      estimateBatchTransactionSize(candidateBatch, network, dynamicFee) > maxTransactionBytes;

    if ((exceedsOperationLimit || exceedsSizeLimit) && currentBatch.length > 0) {
      batches.push({
        transactionIndex,
        payments: currentBatch,
      });
      currentBatch = [];
      transactionIndex++;
    }

    const singleInstructionSize = estimateBatchTransactionSize([instruction], network, dynamicFee);
    if (singleInstructionSize > maxTransactionBytes) {
      throw new Error(
        `Payment to ${instruction.address} exceeds the Stellar transaction size limit`,
      );
    }

    currentBatch.push(instruction);
  }

  // Add remaining payments as final batch
  if (currentBatch.length > 0) {
    batches.push({
      transactionIndex,
      payments: currentBatch,
    });
  }

  return batches;
}

/**
 * Parse asset string to code and issuer
 */
export function parseAsset(assetString: string): Asset {
  if (assetString === 'XLM') {
    return {
      code: 'XLM',
      issuer: null,
    };
  }

  const [code, issuer] = assetString.split(':');
  return {
    code,
    issuer,
  };
}

import { validatePaymentInstruction } from './validator';

/**
 * Get summary statistics for a batch of payments
 */
export function getBatchSummary(instructions: PaymentInstruction[]) {
  let totalAmount = new Big('0');
  let validCount = 0;
  let invalidCount = 0;
  const assetCount = new Map<string, number>();

  for (const instruction of instructions) {
    totalAmount = totalAmount.plus(instruction.amount);
    assetCount.set(instruction.asset, (assetCount.get(instruction.asset) || 0) + 1);

    const validation = validatePaymentInstruction(instruction);
    if (validation.valid) {
      validCount++;
    } else {
      invalidCount++;
    }
  }

  return {
    recipientCount: instructions.length,
    validCount,
    invalidCount,
    totalAmount: totalAmount.toString(),
    assetBreakdown: Object.fromEntries(assetCount),
  };
}
