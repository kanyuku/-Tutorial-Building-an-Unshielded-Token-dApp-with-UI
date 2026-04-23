/**
 * Standalone interaction script for CLI usage
 */
import { connectWallet, mintUnshieldedTokens, sendUnshielded } from '../src/lib/midnight/interact';

async function main() {
  console.log("Starting Midnight Interaction Script...");
  
  // 1. Connect
  await connectWallet();
  console.log("Wallet connected.");

  // 2. Mint
  console.log("Minting 1000 tokens...");
  await mintUnshieldedTokens(1000);
  
  // 3. Send
  const recipient = "0xExampleRecipientAddress";
  console.log(`Sending 500 tokens to ${recipient}...`);
  await sendUnshielded(recipient, 500);

  console.log("Interaction complete!");
}

if (require.main === module) {
  main().catch(console.error);
}
