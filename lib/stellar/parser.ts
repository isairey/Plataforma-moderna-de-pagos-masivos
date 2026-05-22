/**
 * Parser for converting JSON and CSV inputs to payment instructions
 */

import Papa from 'papaparse';
import { ParsedPaymentFile, PaymentInstruction, MemoType } from './types';
import { validatePaymentInstruction } from './validator';

export function parseJSON(content: string): PaymentInstruction[] {
  try {
    const data = JSON.parse(content);

    // Handle both array and object with payments property
    const rawInstructions = Array.isArray(data) ? data : data.payments;

    if (!Array.isArray(rawInstructions)) {
      throw new Error('Expected an array of payment instructions or object with "payments" array');
    }

    return rawInstructions.map((item: Record<string, unknown>) => {
      const instruction: PaymentInstruction = {
        address: String(item.address ?? ''),
        amount: String(item.amount ?? ''),
        asset: String(item.asset ?? ''),
      };

      if (item.memo != null && String(item.memo).trim() !== '') {
        instruction.memo = String(item.memo).trim();
        if (item.memoType != null) {
          const mt = String(item.memoType).toLowerCase();
          if (mt === 'text' || mt === 'id' || mt === 'none') {
            instruction.memoType = mt as MemoType;
          }
        }
      }

      return instruction;
    });
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function parseCSV(content: string): PaymentInstruction[] {
  if (!content.trim()) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    throw new Error(`Failed to parse CSV: ${parsed.errors[0].message}`);
  }

  const headers = parsed.meta.fields?.map(header => header.trim().toLowerCase()) ?? [];
  if (headers.length === 0 || parsed.data.length === 0) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const addressIndex = headers.indexOf('address');
  const amountIndex = headers.indexOf('amount');
  const assetIndex = headers.indexOf('asset');

  if (addressIndex === -1 || amountIndex === -1 || assetIndex === -1) {
    throw new Error('CSV must have "address", "amount", and "asset" columns');
  }

  const hasMemo = headers.indexOf('memo') !== -1;
  const hasMemoType = headers.indexOf('memotype') !== -1;

  const instructions = parsed.data.map(row => {
    const instruction: PaymentInstruction = {
      address: String(row.address || '').trim(),
      amount: String(row.amount || '').trim(),
      asset: String(row.asset || '').trim(),
    };

    if (hasMemo) {
      const memo = String(row.memo || '').trim();
      if (memo) {
        instruction.memo = memo;
        if (hasMemoType) {
          const mt = String(row.memotype || '').trim().toLowerCase();
          if (mt === 'text' || mt === 'id' || mt === 'none') {
            instruction.memoType = mt as MemoType;
          }
        }
      }
    }

    return instruction;
  });

  if (instructions.length === 0) {
    throw new Error('No valid payment instructions found in CSV');
  }

  return instructions;
}

export function parseInput(content: string, format: 'json' | 'csv'): PaymentInstruction[] {
  if (format === 'json') {
    return parseJSON(content);
  } else if (format === 'csv') {
    return parseCSV(content);
  } else {
    throw new Error(`Unknown format: ${format}`);
  }
}

export function analyzeParsedPayments(
  instructions: PaymentInstruction[],
  rowOffset = 1,
): ParsedPaymentFile {
  const rows = instructions.map((instruction, index) => {
    const validation = validatePaymentInstruction(instruction);

    return {
      rowNumber: rowOffset + index,
      instruction,
      valid: validation.valid,
      error: validation.error,
    };
  });

  return {
    rows,
    validPayments: rows.filter(row => row.valid).map(row => row.instruction),
    invalidCount: rows.filter(row => !row.valid).length,
  };
}

export function parsePaymentFile(content: string, format: 'json' | 'csv'): ParsedPaymentFile {
  const instructions = parseInput(content, format);
  return analyzeParsedPayments(instructions, format === 'csv' ? 2 : 1);
}

export function parseFileStream(
  file: File,
  callbacks: {
    onProgress?: (count: number) => void;
    onComplete: (payments: PaymentInstruction[]) => void;
    onError: (error: Error) => void;
  }
) {
  const instructions: PaymentInstruction[] = [];
  let rowCount = 0;
  let aborted = false;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim().toLowerCase(),
    chunk: (results, parser) => {
      if (aborted) return;
      const data = results.data as Record<string, unknown>[];

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        const instruction: PaymentInstruction = {
          address: String(row.address || '').trim(),
          amount: String(row.amount || '').trim(),
          asset: String(row.asset || '').trim(),
        };

        const memo = String(row.memo || '').trim();
        if (memo) {
          instruction.memo = memo;
          const mt = String(row.memotype || row.memoType || '').trim().toLowerCase();
          if (mt === 'text' || mt === 'id' || mt === 'none') {
            instruction.memoType = mt as MemoType;
          }
        }

        if (!instruction.address || !instruction.amount || !instruction.asset) {
          aborted = true;
          parser.abort();
          callbacks.onError(new Error(`Row ${rowCount + i + 1} has insufficient columns: requires address, amount, asset`));
          return;
        }

        const validation = validatePaymentInstruction(instruction);
        if (!validation.valid) {
          aborted = true;
          parser.abort();
          callbacks.onError(new Error(`Row ${rowCount + i + 1}: ${validation.error}`));
          return;
        }

        instructions.push(instruction);
      }

      rowCount += data.length;
      if (callbacks.onProgress) {
        callbacks.onProgress(rowCount);
      }
    },
    error: (error: Error) => {
      if (aborted) return;
      aborted = true;
      callbacks.onError(new Error(`CSV Parse Error: ${error.message}`));
    },
    complete: () => {
      if (aborted) return;

      if (instructions.length === 0) {
        callbacks.onError(new Error('No valid payment instructions found in CSV'));
      } else {
        callbacks.onComplete(instructions);
      }
    }
  });
}
