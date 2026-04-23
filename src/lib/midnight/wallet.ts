/**
 * Wallet utilities for Midnight MCP
 */

export async function getWalletAddress() {
  return "0x..." + Math.random().toString(16).slice(2, 10);
}

export async function signTransaction(payload: any) {
  console.log("Signing payload:", payload);
  return "0xsignature...";
}
