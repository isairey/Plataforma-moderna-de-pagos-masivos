'use client';

import { useState } from 'react';
import { BatchResult, PaymentInstruction } from '@/lib/stellar/types';
import { Button } from '@/components/ui/button';
import { formatAmount } from '@/lib/stellar';

interface TxStatusResult {
  found: boolean;
  hash: string;
  successful?: boolean;
  ledger?: number;
  createdAt?: string;
  message?: string;
  error?: string;
}

interface ResultsDisplayProps {
  result: BatchResult;
  onRetry?: (failedPayments: PaymentInstruction[]) => void;
}

export function ResultsDisplay({ result, onRetry }: ResultsDisplayProps) {
  const successCount = result.summary.successful;
  const failCount = result.summary.failed;
  const successRate = Math.round((successCount / result.totalRecipients) * 100);

  const [checkingHash, setCheckingHash] = useState<string | null>(null);
  const [txStatuses, setTxStatuses] = useState<Record<string, TxStatusResult>>({});

  const handleCheckStatus = async (hash: string) => {
    setCheckingHash(hash);
    try {
      const res = await fetch(
        `/api/tx-status?hash=${encodeURIComponent(hash)}&network=${result.network}`,
      );
      const data: TxStatusResult = await res.json();
      setTxStatuses((prev) => ({ ...prev, [hash]: data }));
    } catch {
      setTxStatuses((prev) => ({
        ...prev,
        [hash]: { found: false, hash, error: 'Failed to check status' },
      }));
    } finally {
      setCheckingHash(null);
    }
  };

  const explorerUrl = (hash: string) =>
    result.network === 'testnet'
      ? `https://stellar.expert/explorer/testnet/tx/${hash}`
      : `https://stellar.expert/explorer/public/tx/${hash}`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-muted-foreground text-sm">Successful</p>
          <p className="text-2xl font-bold text-green-600">{successCount}</p>
          <p className="text-xs text-muted-foreground mt-1">{successRate}% success rate</p>
        </div>

        <div className="bg-card p-4 rounded-lg border border-border">
          <p className="text-muted-foreground text-sm">Failed</p>
          <p className="text-2xl font-bold text-destructive">{failCount}</p>
          <p className="text-xs text-muted-foreground mt-1">of {result.totalRecipients} total</p>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border">
        <h3 className="font-semibold mb-2">Batch Details</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-mono">{result.network}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Transactions:</span>
            <span className="font-mono">{result.totalTransactions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-mono">{formatAmount(result.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Timestamp:</span>
            <span className="font-mono text-xs">{new Date(result.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Payment Details</h3>
        <div className="bg-card border border-border rounded-lg overflow-hidden max-h-96">
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm min-w-[500px] md:min-w-full">
              <thead className="bg-secondary sticky top-0 z-10">
                <tr>
                  <th className="text-left p-3 font-semibold">Recipient</th>
                  <th className="text-right p-3 font-semibold">Amount</th>
                  <th className="text-center p-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((payment, idx) => {
                  const txStatus = payment.transactionHash
                    ? txStatuses[payment.transactionHash]
                    : undefined;

                  return (
                    <tr key={idx} className="border-t border-border hover:bg-secondary/50">
                      <td className="p-3 font-mono text-xs">
                        <span className="hidden md:inline">{payment.recipient}</span>
                        <span className="md:hidden">{payment.recipient.slice(0, 16)}...{payment.recipient.slice(-4)}</span>
                      </td>
                      <td className="text-right p-3 font-mono">{formatAmount(payment.amount)}</td>
                      <td className="text-center p-3">
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                              payment.status === 'success'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                            }`}
                          >
                            {payment.status}
                          </span>

                          {payment.transactionHash && (
                            <div className="flex flex-col items-center gap-1">
                              <a
                                href={explorerUrl(payment.transactionHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-primary hover:underline"
                              >
                                View on Explorer
                              </a>

                              {payment.status === 'failed' && !txStatus && (
                                <button
                                  onClick={() => handleCheckStatus(payment.transactionHash!)}
                                  disabled={checkingHash === payment.transactionHash}
                                  className="text-[10px] text-amber-500 hover:underline disabled:opacity-50"
                                >
                                  {checkingHash === payment.transactionHash
                                    ? 'Checking...'
                                    : 'Check Status'}
                                </button>
                              )}

                              {txStatus && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    txStatus.found && txStatus.successful
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                      : txStatus.found && !txStatus.successful
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                  }`}
                                >
                                  {txStatus.found && txStatus.successful
                                    ? `Confirmed (ledger ${txStatus.ledger})`
                                    : txStatus.found && !txStatus.successful
                                      ? 'Failed on-chain'
                                      : 'Not found on network'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {failCount > 0 && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold text-destructive">Partial Failure</p>
              <p className="text-xs text-muted-foreground">{failCount} payments failed to process.</p>
              <p className="text-xs text-muted-foreground mt-1">
                If a transaction timed out, use &quot;Check Status&quot; to verify its final state on Horizon.
              </p>
            </div>
            {onRetry && (
              <Button
                onClick={() => {
                  const failed = result.results
                    .filter(r => r.status === 'failed')
                    .map(r => ({
                      address: r.recipient,
                      amount: r.amount,
                      asset: r.asset
                    }));
                  onRetry(failed);
                }}
                variant="destructive"
                size="sm"
                className="shadow-sm transition-all hover:scale-105 active:scale-95"
              >
                Retry Failed Only
              </Button>
            )}
          </div>
          <div className="space-y-1 text-muted-foreground max-h-32 overflow-y-auto">
            {result.results
              .filter(r => r.status === 'failed')
              .map((payment, idx) => (
                <div key={idx} className="text-xs flex justify-between items-center gap-2">
                  <span className="font-mono">{payment.recipient.slice(0, 20)}...</span>
                  <span className="text-destructive/80 italic flex-1 text-right">{payment.error}</span>
                  {payment.transactionHash && (
                    <button
                      onClick={() => handleCheckStatus(payment.transactionHash!)}
                      disabled={checkingHash === payment.transactionHash}
                      className="text-amber-500 hover:underline whitespace-nowrap disabled:opacity-50"
                    >
                      {checkingHash === payment.transactionHash ? 'Checking...' : 'Check Status'}
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
