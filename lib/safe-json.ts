/**
 * JSON serialization helper that safely converts BigInt values to strings.
 *
 * Next.js API routes use JSON.stringify internally, which throws a TypeError
 * when the payload contains BigInt values (common in Stellar SDK responses).
 * This module provides a drop-in NextResponse.json replacement that handles
 * BigInt serialization transparently.
 */

import { NextResponse } from "next/server";

/**
 * JSON replacer that converts BigInt values to strings.
 */
function bigIntReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

/**
 * Drop-in replacement for NextResponse.json() that safely handles BigInt.
 *
 * Usage:
 *   return safeJsonResponse({ ledger: 123n, hash: "abc" });
 *   return safeJsonResponse({ error: "..." }, { status: 400 });
 */
export function safeJsonResponse(
  data: unknown,
  init?: ResponseInit,
): NextResponse {
  const body = JSON.stringify(data, bigIntReplacer);
  return new NextResponse(body, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
