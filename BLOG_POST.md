# Build Your First Midnight dApp: Unshielded Token with React Frontend

Privacy is the next frontier of blockchain, but before you dive into zero-knowledge proofs and shielded state, you need to master the fundamentals. Today, we’re building a complete mini-dApp on **Midnight**, the privacy-focused sidechain from IOG. 

In this tutorial, we’ll build an **Unshielded Token** system. Why unshielded? Because it’s the perfect "Hello World" for Midnight’s **Compact** language and interaction model.

---

## 🏗️ What You’ll Build
We are delivering a full end-to-end flow:
1.  **A Smart Contract** written in Compact.
2.  **A TypeScript Interaction Layer** to talk to the chain.
3.  **A React Frontend** that looks like a professional technical dashboard.

---

## ⚙️ 1. Prerequisites
Before we start, ensure you have:
*   **Node.js** (v18+)
*   **Midnight MCP** (Midnight Connector Protocol)
*   **Docker** (to run the local Midnight stack)

```bash
# Install the Midnight developer tools
npm install -g midnight-mcp
```

---

## 🧠 2. Writing the Smart Contract (`Token.compact`)
Midnight uses **Compact**, a domain-specific language designed for writing zero-knowledge circuits and smart contracts.

The contract defines our ledger state: a simple mapping of addresses to balances.

```compact
pragma language 0.1.0;
import './ledger' as ledger;

export ledger state {
  balances: Map<Address, Uint64>;
}

// Mints tokens to the caller's address
export circuit mintUnshieldedToken(amount: Uint64) : void {
  const account: Address = check_body_signature();
  const current_balance: Uint64 = balances.get(account).default(0n);
  balances.insert(account, current_balance + amount);
}

// Transfers tokens between unshielded accounts
export circuit sendUnshielded(recipient: Address, amount: Uint64) : void {
  const sender: Address = check_body_signature();
  const sender_balance: Uint64 = balances.get(sender).default(0n);
  
  assert(sender_balance >= amount, "Insufficient balance");
  
  const recipient_balance: Uint64 = balances.get(recipient).default(0n);
  balances.insert(sender, sender_balance - amount);
  balances.insert(recipient, recipient_balance + amount);
}

// Utility function to sync incoming state
export circuit receiveUnshielded() : void {
  check_body_signature();
}
```

**Key Concept:** `check_body_signature()` verifies the transaction is authorized by the caller. Even in unshielded mode, Midnight ensures the integrity of the state updates.

---

## 🛠️ 3. Real SDK Integration (`realProvider.ts`)
In a production dApp, we don't mock. We use the official `@midnight-ntwrk/midnight-js` package to communicate with the Midnight Wallet (MCP) and the Midnight L1 node.

```typescript
import { createContract, NetworkId } from '@midnight-ntwrk/midnight-js';

// Connect to the provider
const provider = await (window as any).midnight.connect();

// Interaction with the compiled contract
const contract = await createContract(TOKEN_CONFIG, provider);
await contract.mintUnshieldedToken(100n);
```

---

## 💻 4. The Interaction Layer
Your frontend should always consume a clean abstraction. We use an interaction layer that maps user inputs to real contract circuit calls.

```typescript
import { midnightProvider } from './realProvider';

export async function mintUnshieldedTokens(amount: number) {
  return await midnightProvider.mint(BigInt(amount));
}

export async function sendUnshielded(recipient: string, amount: number) {
  return await midnightProvider.transfer(recipient, BigInt(amount));
}
```

---

## 🎨 5. The React Frontend
For the UI, we used a **Technical Dashboard** aesthetic. It’s clean, precise, and feels like a professional financial tool. Using **Tailwind CSS** and **Lucide Icons**, we built a layout that emphasizes transparency and scannability.

### Features:
*   **Wallet Connection:** Securely link to Midnight MCP.
*   **Live Balance:** Real-time updates from the L1 ledger.
*   **Action Forms:** Clearly labeled "Circuit Execution" buttons for Minting and Sending.
*   **Transaction Log:** A real-time feed of local proofs and state changes.

---

## ⚖️ 6. Unshielded vs. Shielded Tokens
Wait, isn't Midnight about privacy? Yes! But unshielded tokens have a vital role:

| Feature | Unshielded | Shielded |
| :--- | :--- | :--- |
| **Privacy** | ❌ Publicly visible | ✅ Fully private |
| **Simplicity** | ✅ Familiar ledger model | ❌ Complex state transitions |
| **Use Case** | Governance, Public Sales | Salaries, Private Tx |
| **Debugging** | Easy (Check explorer) | Harder (Needs view keys) |

**Pro Tip:** Start with unshielded token logic to verify your dApp's business logic before adding the privacy layer with `Zswap` or custom ZK circuits.

---

## 🚀 7. Running the App
1.  Clone the repo.
2.  Run `npm install`.
3.  Start your local Midnight node.
4.  Run `npm run dev` and open `localhost:3000`.

---

## 🏁 Conclusion
You just built your first Midnight dApp! You’ve mastered the Compact contract structure, implemented unshielded token logic, and wrapped it in a polished React frontend.

**What's next?**
*   Transform this into a **Shielded Token** by using the `ledger` import for private state.
*   Add **Identity Proofs** (Midnight's other superpower) to restrict who can mint.

Happy building on Midnight! 🌑✨
