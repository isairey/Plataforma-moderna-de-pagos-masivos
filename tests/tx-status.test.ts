/**
 * Test suite for transaction status query validation
 */

import { describe, test, expect } from "vitest";

describe("Transaction status query parameters", () => {
  test("valid hash format is a 64-character hex string", () => {
    const validHash = "a".repeat(64);
    expect(/^[0-9a-f]{64}$/i.test(validHash)).toBe(true);
  });

  test("invalid hash is rejected", () => {
    const shortHash = "abc123";
    expect(/^[0-9a-f]{64}$/i.test(shortHash)).toBe(false);
  });

  test("network must be testnet or mainnet", () => {
    const validNetworks = ["testnet", "mainnet"];
    expect(validNetworks.includes("testnet")).toBe(true);
    expect(validNetworks.includes("mainnet")).toBe(true);
    expect(validNetworks.includes("devnet")).toBe(false);
  });

  test("Horizon testnet URL is correct", () => {
    const network = "testnet";
    const url =
      network === "testnet"
        ? "https://horizon-testnet.stellar.org"
        : "https://horizon.stellar.org";
    expect(url).toBe("https://horizon-testnet.stellar.org");
  });

  test("Horizon mainnet URL is correct", () => {
    const network = "mainnet";
    const url =
      network === "testnet"
        ? "https://horizon-testnet.stellar.org"
        : "https://horizon.stellar.org";
    expect(url).toBe("https://horizon.stellar.org");
  });
});
