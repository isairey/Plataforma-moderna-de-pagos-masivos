/**
 * Test suite for batching functions
 */

import { Keypair } from 'stellar-sdk';

import {
  createBatches,
  estimateBatchTransactionSize,
  getBatchSummary,
  parseAsset,
} from '../lib/stellar/batcher';

const firstAddress = Keypair.random().publicKey();
const secondAddress = Keypair.random().publicKey();
const thirdAddress = Keypair.random().publicKey();
const issuerAddress = Keypair.random().publicKey();

const samplePayments = [
  {
    address: firstAddress,
    amount: '100',
    asset: 'XLM',
  },
  {
    address: secondAddress,
    amount: '50',
    asset: 'XLM',
  },
  {
    address: thirdAddress,
    amount: '75',
    asset: 'XLM',
  },
];

describe('Batch Creation', () => {
  test('creates single batch when below max operations', async () => {
    const batches = await createBatches(samplePayments, 100);
    expect(batches).toHaveLength(1);
    expect(batches[0].payments).toHaveLength(3);
  });

  test('creates multiple batches when exceeding max operations', async () => {
    const batches = await createBatches(samplePayments, 2);
    expect(batches).toHaveLength(2);
    expect(batches[0].payments).toHaveLength(2);
    expect(batches[1].payments).toHaveLength(1);
  });

  test('assigns correct transaction indices', async () => {
    const batches = await createBatches(samplePayments, 1);
    expect(batches[0].transactionIndex).toBe(0);
    expect(batches[1].transactionIndex).toBe(1);
    expect(batches[2].transactionIndex).toBe(2);
  });

  test('preserves payment data in batches', async () => {
    const batches = await createBatches(samplePayments, 10);
    expect(batches[0].payments[0]).toEqual(samplePayments[0]);
  });

  test('handles single payment', async () => {
    const payments = [samplePayments[0]];
    const batches = await createBatches(payments, 1);
    expect(batches).toHaveLength(1);
    expect(batches[0].payments).toHaveLength(1);
  });

  test('handles large batch size', async () => {
    const batches = await createBatches(samplePayments, 1000);
    expect(batches).toHaveLength(1);
    expect(batches[0].payments).toHaveLength(3);
  });

  test('splits batches before exceeding transaction byte limit', async () => {
    const maxTransactionBytes =
      estimateBatchTransactionSize(samplePayments) - 1;

    const batches = await createBatches(samplePayments, 100, {
      maxTransactionBytes,
    });

    expect(batches).toHaveLength(2);
    expect(batches[0].payments).toHaveLength(2);
    expect(batches[1].payments).toHaveLength(1);
  });

  test('rejects a single payment that exceeds the size limit', async () => {
    const size = estimateBatchTransactionSize([samplePayments[0]]);

    await expect(
      createBatches([samplePayments[0]], 100, {
        maxTransactionBytes: size - 1,
      }),
    ).rejects.toThrow('exceeds the Stellar transaction size limit');
  });
});

describe('Asset Parsing', () => {
  test('parses native XLM', () => {
    const asset = parseAsset('XLM');
    expect(asset.code).toBe('XLM');
    expect(asset.issuer).toBeNull();
  });

  test('parses issued asset', () => {
    const asset = parseAsset(`USDC:${issuerAddress}`);
    expect(asset.code).toBe('USDC');
    expect(asset.issuer).toBe(issuerAddress);
  });

  test('parses asset with long code', () => {
    const asset = parseAsset(`LONGCODE123:${issuerAddress}`);
    expect(asset.code).toBe('LONGCODE123');
    expect(asset.issuer).toBe(issuerAddress);
  });
});

describe('Batch Summary', () => {
  test('calculates total amount', () => {
    const summary = getBatchSummary(samplePayments);
    expect(summary.totalAmount).toBe('225');
  });

  test('counts recipients', () => {
    const summary = getBatchSummary(samplePayments);
    expect(summary.recipientCount).toBe(3);
  });

  test('groups by asset', () => {
    const summary = getBatchSummary(samplePayments);
    expect(summary.assetBreakdown['XLM']).toBe(3);
  });

  test('handles multiple assets', () => {
    const payments = [
      {
        address: firstAddress,
        amount: '100',
        asset: 'XLM',
      },
      {
        address: secondAddress,
        amount: '50',
        asset: `USDC:${issuerAddress}`,
      },
    ];
    const summary = getBatchSummary(payments);
    expect(summary.assetBreakdown['XLM']).toBe(1);
    expect(summary.assetBreakdown[`USDC:${issuerAddress}`]).toBe(1);
  });

  test('calculates correct total with decimal amounts', () => {
    const payments = [
      {
        address: firstAddress,
        amount: '10.5',
        asset: 'XLM',
      },
      {
        address: secondAddress,
        amount: '20.25',
        asset: 'XLM',
      },
    ];
    const summary = getBatchSummary(payments);
    expect(summary.totalAmount).toBe('30.75');
  });
});
