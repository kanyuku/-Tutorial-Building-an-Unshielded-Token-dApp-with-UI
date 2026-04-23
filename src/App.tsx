/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Coins, 
  Send, 
  Download, 
  ExternalLink, 
  Shield, 
  ShieldOff,
  Activity,
  History,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { midnightProvider, WalletState } from './lib/midnight/realProvider';
import { 
  connectWallet, 
  mintUnshieldedTokens, 
  sendUnshielded, 
  receiveUnshielded 
} from './lib/midnight/interact';

export default function App() {
  const [wallet, setWallet] = useState<WalletState>({
    address: '',
    balance: 0n,
    isConnected: false,
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [mintAmount, setMintAmount] = useState<string>('100');
  const [sendAddress, setSendAddress] = useState<string>('');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [txHistory, setTxHistory] = useState<{ id: string; type: string; amount: string; time: string }[]>([]);

  useEffect(() => {
    const unsubscribe = midnightProvider.subscribe(setWallet);
    return unsubscribe;
  }, []);

  const handleAction = async (name: string, fn: () => Promise<void>) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      await fn();
      const newTx = {
        id: Math.random().toString(36).substring(7),
        type: name,
        amount: name === 'mint' ? mintAmount : (name === 'send' ? sendAmount : '-'),
        time: new Date().toLocaleTimeString(),
      };
      setTxHistory(prev => [newTx, ...prev].slice(0, 5));
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-white">
      {/* Top Navigation / Header */}
      <nav className="border-b border-[#141414] px-6 py-4 flex justify-between items-center bg-[#E4E3E0]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#141414] p-1.5 rounded">
            <ShieldOff className="text-[#E4E3E0] w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono font-bold tracking-tighter uppercase text-lg">Midnight Unshielded</h1>
            <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest leading-none">Developer Preview v0.1.0</p>
          </div>
        </div>

        <button 
          onClick={() => wallet.isConnected ? midnightProvider.disconnect() : connectWallet()}
          className={`flex items-center gap-2 px-4 py-2 border border-[#141414] font-mono text-xs uppercase transition-colors hover:bg-[#141414] hover:text-[#E4E3E0] ${wallet.isConnected ? 'bg-[#141414] text-[#E4E3E0]' : ''}`}
        >
          <Wallet className="w-4 h-4" />
          {wallet.isConnected ? `Connected: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Connect Wallet'}
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats and Info */}
        <div className="lg:col-span-4 space-y-8">
          {/* Balance Card */}
          <section className="border border-[#141414] p-6 bg-white flex flex-col justify-between aspect-square lg:aspect-auto lg:h-64 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] uppercase opacity-50 italic">Total Unshielded Balance</span>
              <Activity className="w-4 h-4 opacity-30 group-hover:animate-pulse" />
            </div>
            
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-mono tracking-tighter font-bold">
                  {wallet.isConnected ? Number(wallet.balance).toLocaleString() : '0'}
                </span>
                <span className="text-xl font-mono opacity-40">MDT</span>
              </div>
              <p className="text-[11px] font-mono mt-2 opacity-50 uppercase">Transactions verified on Midnight L1</p>
            </div>

            <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <Coins size={180} />
            </div>
          </section>

          {/* Network Status */}
          <section className="border border-[#141414] p-4 bg-[#141414] text-[#E4E3E0]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-[11px] uppercase letter-spacing-widest">Network Integrity</h3>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-green-500">Node Active</span>
              </div>
            </div>
            <div className="space-y-2 opacity-70 text-[11px] font-mono">
              <div className="flex justify-between">
                <span>Network</span>
                <span>Midnight DevNet</span>
              </div>
              <div className="flex justify-between">
                <span>Protocol</span>
                <span>Compact v0.1.0</span>
              </div>
              <div className="flex justify-between">
                <span>Proof Type</span>
                <span>Groth16 (Unshielded Mode)</span>
              </div>
            </div>
          </section>

          {/* Why Unshielded Segment */}
          <section className="p-6 border border-dashed border-[#141414] bg-transparent">
             <div className="flex items-center gap-2 mb-3">
               <Info className="w-4 h-4 opacity-50" />
               <h3 className="font-mono text-xs uppercase font-bold">Design Note</h3>
             </div>
             <p className="text-sm font-sans italic opacity-70 leading-relaxed">
               "Unshielded tokens provide the transparency for public ledgers while maintaining the efficiency of the Midnight execution model. Use them for governance, public sales, or testing your first Compact circuits."
             </p>
          </section>
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mint Form */}
            <motion.div 
              layout
              className="border border-[#141414] bg-white p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-[#141414] p-1.5 rounded-sm">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-mono font-bold uppercase text-sm">Mint Tokens</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase opacity-50">Amount to Mint</label>
                  <input 
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    className="w-full bg-[#f4f4f4] border-b border-[#141414] p-3 font-mono focus:outline-none focus:bg-white transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <button 
                  disabled={!wallet.isConnected || loading.mint}
                  onClick={() => handleAction('mint', () => mintUnshieldedTokens(Number(mintAmount)))}
                  className="w-full bg-[#141414] text-white py-3 font-mono text-xs uppercase tracking-widest disabled:opacity-30 flex items-center justify-center gap-2"
                >
                  {loading.mint ? <Activity className="w-4 h-4 animate-spin" /> : 'Execute Mint Circuit'}
                </button>
              </div>
            </motion.div>

            {/* Transfer Form */}
            <motion.div 
              layout
              className="border border-[#141414] bg-white p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-[#141414] p-1.5 rounded-sm">
                  <Send className="w-4 h-4 text-white" />
                </div>
                <h2 className="font-mono font-bold uppercase text-sm">Send Unshielded</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase opacity-50">Recipient Address</label>
                  <input 
                    type="text"
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                    className="w-full bg-[#f4f4f4] border-b border-[#141414] p-3 font-mono text-xs focus:outline-none focus:bg-white transition-colors"
                    placeholder="0x..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase opacity-50">Transfer Amount</label>
                  <input 
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="w-full bg-[#f4f4f4] border-b border-[#141414] p-3 font-mono focus:outline-none focus:bg-white transition-colors"
                    placeholder="0.00"
                  />
                </div>
                <button 
                  disabled={!wallet.isConnected || loading.send}
                  onClick={() => handleAction('send', () => sendUnshielded(sendAddress, Number(sendAmount)))}
                  className="w-full bg-[#141414] text-white py-3 font-mono text-xs uppercase tracking-widest disabled:opacity-30 flex items-center justify-center gap-2"
                >
                   {loading.send ? <Activity className="w-4 h-4 animate-spin" /> : 'Dispatch Proof'}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Third Action: Receive / Receipt */}
          <div className="border border-[#141414] bg-[#E4E3E0] p-6 relative group border-dashed">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#141414] p-2 rounded-full text-white">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono font-bold uppercase text-sm">Receipt Synchronization</h3>
                  <p className="text-xs font-sans opacity-60">Validate and finalize incoming unshielded transfers on your local ledger.</p>
                </div>
              </div>
              <button 
                disabled={!wallet.isConnected || loading.receive}
                onClick={() => handleAction('receive', receiveUnshielded)}
                className="bg-transparent border border-[#141414] hover:bg-[#141414] hover:text-white transition-all px-8 py-3 font-mono text-xs uppercase disabled:opacity-30"
              >
                Sync Incoming
              </button>
            </div>
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="w-1 h-4 bg-[#141414] opacity-20" />
              <span className="w-1 h-3 bg-[#141414] opacity-20" />
              <span className="w-1 h-2 bg-[#141414] opacity-20" />
            </div>
          </div>

          {/* Transaction History (Mock Log) */}
          <div className="border border-[#141414] bg-white overflow-hidden">
            <div className="bg-[#141414] px-4 py-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#E4E3E0]" />
                <span className="text-[#E4E3E0] font-mono text-[10px] uppercase font-bold tracking-widest">Recent Activity</span>
              </div>
              <span className="text-[#E4E3E0]/40 font-mono text-[9px] uppercase italic">Real-time Feed</span>
            </div>
            
            <div className="divide-y divide-[#141414]/10">
              {txHistory.length === 0 ? (
                <div className="p-12 text-center opacity-30 italic font-mono text-xs">No transactions recorded on this session.</div>
              ) : (
                txHistory.map((tx) => (
                  <div key={tx.id} className="p-3 pl-4 flex justify-between items-center hover:bg-[#f9f9f9]">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-4 bg-[#141414]" />
                      <div>
                        <div className="font-mono font-bold uppercase text-[11px] leading-tight flex items-center gap-2">
                          {tx.type} 
                          <span className="font-normal opacity-50 px-1 border border-[#141414]/20 text-[9px]">{tx.id}</span>
                        </div>
                        <div className="text-[10px] font-mono opacity-40">{tx.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="font-mono text-xs font-bold">
                        {tx.type === 'send' ? '-' : '+'}{tx.amount} MDT
                       </span>
                       <ExternalLink className="w-3 h-3 opacity-30 cursor-pointer hover:opacity-100" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="mt-20 border-t border-[#141414] p-6 text-center">
        <p className="font-mono text-[10px] uppercase opacity-40 tracking-[0.2em]">
          Powered by Midnight Protocol & Compact v0.1 | Decentralized Privacy
        </p>
      </footer>
    </div>
  );
}

