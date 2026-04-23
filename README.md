# Midnight Unshielded Token dApp

A beginner-friendly demonstration of a decentralized application built on the Midnight Network using the Compact smart contract language and React.

## 📁 Project Structure

```text
/
├── contract/
│   └── Token.compact      # The Mint/Transfer smart contract
├── scripts/
│   └── interact.ts        # Standalone TypeScript interaction script
├── src/
│   ├── lib/midnight/
│   │   ├── interact.ts    # Main interaction layer
│   │   ├── wallet.ts      # Wallet utilities
│   │   ├── api.ts         # Mock data API
│   │   └── mockProvider.ts # Simulation for preview mode
│   └── App.tsx            # Technical Dashboard UI
└── BLOG_POST.md           # Full Tutorial / Education Guide
```

## 🛠️ Setup & Run

### 1. Local Development (Preview)
Simply run the following command to start the React dashboard in simulation mode:
```bash
npm run dev
```

### 2. Midnight DevNet Deployment
To deploy to a real Midnight node:
1.  **Install Midnight Tools**: `npm install -g midnight-mcp`
2.  **Start Docker**: Ensure the Midnight network stack is running.
3.  **Compile**: `midnight compile contract/Token.compact`
4.  **Deploy**: `midnight deploy`

## 🧪 Key Features
- **Unshielded Minting**: Execute public mint circuits.
- **Atomic Transfers**: Send tokens between unshielded addresses.
- **Proof-Based UI**: Visualize proof generation and dispatching status.
- **Technical Aesthetic**: Designed for developers and blockchain engineers.

## 📚 Documentation
Check out [BLOG_POST.md](./BLOG_POST.md) for the full "Build your first Midnight dApp" tutorial, explaining the code in detail.

---
*Created for the Midnight Developer Bounty.*
