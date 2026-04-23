/**
 * Real Midnight Network Provider
 * Connects to a real Midnight Node and Wallet using the official SDK.
 */

import { 
  contracts,
  types as midnightTypes,
} from '@midnight-ntwrk/midnight-js';
import { Wallet } from '@midnight-ntwrk/wallet-api';
import { TokenContract } from './contractTypes';
import TokenArtifact from './gen/Token.json';

// Map the imported JSON to the type expected by the SDK
const TOKEN_COMPILED_CONTRACT: any = TokenArtifact;

// Network identifies the specific Midnight chain (DevNet, TestNet, etc.)
const NetworkIdConst = {
  DevNet: 'midnight-devnet',
  TestNet: 'midnight-testnet'
} as const;

export interface WalletState {
  address: string;
  balance: bigint;
  isConnected: boolean;
}

export class RealMidnightProvider {
  private wallet: Wallet | null = null;
  private deployedContract: contracts.DeployedContract<TokenContract> | null = null;
  private state: WalletState = {
    address: '',
    balance: 0n,
    isConnected: false,
  };

  private listeners: ((state: WalletState) => void)[] = [];

  constructor() {
    this.checkExistingConnection();
  }

  private async checkExistingConnection() {
    // Check if MCP is already available in the window
    if (typeof window !== 'undefined') {
      const midnight = (window as any).midnight;
      if (midnight && typeof midnight.state === 'function') {
        console.log('[Midnight SDK] Auto-detecting active wallet state');
        this.wallet = midnight;
        this.setupWalletSubscription();
      }
    }
  }

  private setupWalletSubscription() {
    if (!this.wallet) return;
    
    this.wallet.state().subscribe((walletState: any) => {
      // Map the real WalletState to our UI state
      let balance = 0n;
      if (walletState.balances) {
        if (typeof walletState.balances.get === 'function') {
          balance = walletState.balances.get('') || walletState.balances.get('tDUST') || 0n;
        } else {
          balance = walletState.balances[''] || walletState.balances['tDUST'] || 0n;
        }
      }
      
      this.state = {
        address: walletState.address || '',
        balance: balance,
        isConnected: true,
      };
      this.notify();
    });
  }

  subscribe(callback: (state: WalletState) => void) {
    this.listeners.push(callback);
    callback(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.state));
  }

  /**
   * Initializes the contract interface using the currently connected wallet.
   */
  private async getContract() {
    if (!this.wallet) throw new Error('Wallet not connected');
    if (this.deployedContract) return this.deployedContract;

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error('VITE_CONTRACT_ADDRESS is not set. Please deploy your Token.compact contract to DevNet and add the address to your environment variables.');
    }

    console.log(`[Midnight SDK] Finding deployed contract at ${contractAddress}...`);
    
    // In Midnight SDK, any wallet instance can act as a provider for contracts
    const providers: any = this.wallet; 

    this.deployedContract = await contracts.findDeployedContract<TokenContract>(providers, {
      compiledContract: TOKEN_COMPILED_CONTRACT,
      contractAddress: contractAddress as any,
    });

    return this.deployedContract;
  }

  async connect() {
    if (typeof window === 'undefined') return;

    // Discovery logic for Midnight-compatible wallets
    const connectors: Record<string, any> = {};
    
    const isValidConnector = (obj: any) => {
      if (!obj || typeof obj !== 'object') return false;
      return typeof obj.mn_enable === 'function' || 
             typeof obj.enable === 'function' || 
             typeof obj.connect === 'function' ||
             typeof obj.state === 'function' ||
             (obj.midnight && (typeof obj.midnight.enable === 'function' || typeof obj.midnight.mn_enable === 'function'));
    };

    // 1. Standalone Midnight Wallet
    if (isValidConnector((window as any).midnight)) {
      connectors['Standalone Midnight'] = (window as any).midnight;
    }
    
    // 2. Cardano Wallets (Lace, etc.)
    const cardano = (window as any).cardano;
    if (cardano) {
      // Check standard locations
      if (isValidConnector(cardano.midnight)) connectors['Cardano Namespace'] = cardano.midnight;
      if (isValidConnector(cardano.lace?.midnight)) connectors['Lace (Midnight)'] = cardano.lace.midnight;
      
      // Deep scan all injected Cardano wallets
      Object.keys(cardano).forEach(key => {
        const wallet = cardano[key];
        if (isValidConnector(wallet?.midnight)) {
          connectors[`${key} (Midnight)`] = wallet.midnight;
        } else if (isValidConnector(wallet)) {
          if (key.toLowerCase().includes('midnight') || key.toLowerCase().includes('lace')) {
             connectors[key] = wallet;
          }
        }
      });
    }

    let connector = connectors['Lace (Midnight)'] || 
                    connectors['Standalone Midnight'] || 
                    connectors['lace (Midnight)'] ||
                    connectors['Cardano Namespace'] || 
                    Object.values(connectors)[0];

    if (!connector) {
      const allFound = Object.keys((window as any).cardano || {}).concat((window as any).midnight ? ['midnight'] : []);
      throw new Error(`No valid Midnight connector found. [${allFound.join(', ')}].`);
    }
    
    try {
      if (typeof connector.mn_enable === 'function') {
        this.wallet = await connector.mn_enable();
      } else if (typeof connector.enable === 'function') {
        this.wallet = await connector.enable();
      } else if (typeof connector.connect === 'function') {
        this.wallet = await connector.connect();
      } else if (connector.midnight && typeof connector.midnight.mn_enable === 'function') {
        this.wallet = await connector.midnight.mn_enable();
      } else if (connector.midnight && typeof connector.midnight.enable === 'function') {
        this.wallet = await connector.midnight.enable();
      } else if (typeof connector.state === 'function') {
        this.wallet = connector;
      }
      
      if (!this.wallet) throw new Error('Failed to obtain a wallet instance');

      this.setupWalletSubscription();
    } catch (err) {
      console.error('Wallet connection failed:', err);
      throw err;
    }
  }

  async disconnect() {
    this.wallet = null;
    this.deployedContract = null;
    this.state = { address: '', balance: 0n, isConnected: false };
    this.notify();
  }

  // Contract Interactions - Real SDK Calls
  async mint(amount: bigint) {
    const contract = await this.getContract();
    console.log(`[Midnight SDK] Calling mintUnshieldedToken circuit with amount ${amount}...`);
    
    try {
      // Real circuit call via the CallTx interface
      await contract.callTx.mintUnshieldedToken(amount);
      console.log('[Midnight SDK] Mint transaction successful.');
    } catch (err) {
      console.error('Minting error:', err);
      throw err;
    }
  }

  async transfer(recipient: string, amount: bigint) {
    const contract = await this.getContract();
    console.log(`[Midnight SDK] Calling sendUnshielded circuit to ${recipient}...`);
    
    try {
      await contract.callTx.sendUnshielded(recipient, amount);
      console.log('[Midnight SDK] Transfer transaction successful.');
    } catch (err) {
      console.error('Transfer error:', err);
      throw err;
    }
  }

  async receive() {
    const contract = await this.getContract();
    console.log('[Midnight SDK] Calling receiveUnshielded circuit...');
    
    try {
      await contract.callTx.receiveUnshielded();
      console.log('[Midnight SDK] Synchronization complete.');
    } catch (err) {
      console.error('Sync error:', err);
      throw err;
    }
  }
}

export const midnightProvider = new RealMidnightProvider();

