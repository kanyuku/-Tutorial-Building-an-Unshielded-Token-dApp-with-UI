/**
 * Midnight Interaction Layer
 * These functions connect the UI to the Midnight Network (via MCP).
 */

import { midnightProvider } from './realProvider';

export async function connectWallet() {
  return await midnightProvider.connect();
}

export async function mintUnshieldedTokens(amount: number) {
  return await midnightProvider.mint(BigInt(amount));
}

export async function sendUnshielded(recipient: string, amount: number) {
  return await midnightProvider.transfer(recipient, BigInt(amount));
}

export async function receiveUnshielded() {
  return await midnightProvider.receive();
}
