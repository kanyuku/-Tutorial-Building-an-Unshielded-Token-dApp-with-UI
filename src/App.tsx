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

  const [hasExtension, setHasExtension] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = midnightProvider.subscribe(setWallet);
    
    // Preliminary check for extension
    const checkExt = () => {
      const ext = (window as any).midnight || (window as any).cardano;
      setHasExtension(!!ext);
    };
    
    checkExt();
    window.addEventListener('load', checkExt);
    return () => {
      unsubscribe();
      window.removeEventListener('load', checkExt);
    };
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
      {/* Simplified Navigation */}
      <nav className="border-b border-[#141414] px-8 py-6 flex justify-between items-baseline bg-white sticky top-0 z-50">
        <div className="flex items-baseline gap-4">
          <h1 className="font-sans font-bold tracking-tight text-2xl lowercase italic">midnight.ledger</h1>
          <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest border border-[#141414]/20 px-1.5 py-0.5">devnet_v0.1</span>
        </div>

        <button 
          disabled={loading.connect}
          onClick={() => wallet.isConnected 
            ? midnightProvider.disconnect() 
            : handleAction('connect', connectWallet)
          }
          className={`group flex items-center gap-3 px-6 py-2.5 border border-[#141414] font-mono text-[11px] uppercase transition-all active:scale-[0.98] disabled:opacity-50 ${wallet.isConnected ? 'bg-[#141414] text-white' : 'hover:bg-[#141414] hover:text-white'}`}
        >
          <div className={`w-2 h-2 rounded-full ${wallet.isConnected ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-[#141414]/30 group-hover:bg-white/30'}`} />
          {wallet.isConnected 
            ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)}` 
            : 'Connect Wallet'
          }
        </button>
      </nav>

      {!hasExtension && !wallet.isConnected && (
        <div className="bg-[#141414] text-white p-2.5 text-center text-[10px] font-mono uppercase tracking-[0.15em]">
          Hardware mismatch detected. <a href="https://www.lace.io/" target="_blank" rel="noopener" className="underline font-bold hover:text-amber-400">Install Lace Protocol</a> required.
        </div>
      )}

      <main className="max-w-6xl mx-auto p-8 md:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Main Account View */}
          <div className="lg:col-span-12 mb-12">
             <div className="border-l-4 border-[#141414] pl-8 py-2">
                <span className="font-mono text-[11px] uppercase opacity-40 tracking-widest block mb-2 font-bold">Authenticated Balance</span>
                <div className="flex items-baseline gap-4">
                  <span className="text-8xl font-sans font-black tracking-tighter">
                    {wallet.isConnected ? Number(wallet.balance).toLocaleString() : '0.00'}
                  </span>
                  <span className="text-2xl font-mono opacity-30 italic">dust</span>
                </div>
             </div>
          </div>

          {/* Action Grid */}
          <div className="lg:col-span-7 space-y-16">
            
            {/* Mint Interaction */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-[#141414]/10 pb-4">
                <span className="font-mono text-[10px] opacity-40 font-bold border border-[#141414]/20 rounded-full w-6 h-6 flex items-center justify-center">01</span>
                <h2 className="font-mono font-bold uppercase text-[11px] tracking-widest">Protocol Generation</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-8 items-end">
                <div className="col-span-2 space-y-3">
                  <label className="text-[9px] font-mono uppercase opacity-50 block font-bold tracking-wider">Unit Quantity (Uint64)</label>
                  <input 
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-[#141414] py-4 font-sans text-4xl font-bold focus:outline-none focus:border-black transition-colors"
                    placeholder="0"
                  />
                </div>
                <button 
                  disabled={!wallet.isConnected || loading.mint}
                  onClick={() => handleAction('mint', () => mintUnshieldedTokens(Number(mintAmount)))}
                  className="w-full h-[70px] bg-[#141414] text-white font-mono text-[10px] uppercase tracking-widest disabled:opacity-20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                >
                  {loading.mint ? <Activity className="w-4 h-4 animate-spin" /> : 'Execute Mint'}
                </button>
              </div>
            </section>

            {/* Transfer Interaction */}
            <section className="space-y-8">
              <div className="flex items-center gap-4 border-b border-[#141414]/10 pb-4">
                <span className="font-mono text-[10px] opacity-40 font-bold border border-[#141414]/20 rounded-full w-6 h-6 flex items-center justify-center">02</span>
                <h2 className="font-mono font-bold uppercase text-[11px] tracking-widest">ledger_dispatch</h2>
              </div>

              <div className="space-y-10">
                <div className="space-y-3">
                  <label className="text-[9px] font-mono uppercase opacity-50 block font-bold tracking-wider">Recipient Address (Standard)</label>
                  <input 
                    type="text"
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                    className="w-full bg-transparent border-b border-[#141414]/20 py-3 font-mono text-xs focus:outline-none focus:border-[#141414] transition-colors"
                    placeholder="midnight.addr..."
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-8 items-end">
                  <div className="col-span-2 space-y-3">
                    <label className="text-[9px] font-mono uppercase opacity-50 block font-bold tracking-wider">Dispatch Amount</label>
                    <input 
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-[#141414] py-4 font-sans text-4xl font-bold focus:outline-none focus:border-black transition-colors"
                      placeholder="0"
                    />
                  </div>
                  <button 
                    disabled={!wallet.isConnected || loading.send}
                    onClick={() => handleAction('send', () => sendUnshielded(sendAddress, Number(sendAmount)))}
                    className="w-full h-[70px] border border-[#141414] bg-white text-[#141414] font-mono text-[10px] uppercase tracking-widest disabled:opacity-20 hover:bg-[#141414] hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                     {loading.send ? <Activity className="w-4 h-4 animate-spin" /> : 'Send Session'}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Secondary Column: History & Stats */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* Sync Status */}
            <div className="bg-[#f0efed] p-8 border border-[#141414]/5 space-y-6">
              <div className="flex justify-between items-baseline">
                <h3 className="font-mono font-bold uppercase text-[10px] tracking-widest">Protocol Sync</h3>
                <span className="text-[9px] font-mono text-green-600 bg-green-100 px-1.5 py-0.5 rounded uppercase">Active</span>
              </div>
              <p className="text-xs font-sans opacity-60 leading-relaxed">Ensure local ledger state matches Midnight L1 broadcast history. Essential after inbound unshielded transfers.</p>
              <button 
                disabled={!wallet.isConnected || loading.receive}
                onClick={() => handleAction('receive', receiveUnshielded)}
                className="w-full py-4 border border-[#141414] font-mono text-[10px] uppercase tracking-widest hover:bg-[#141414] hover:text-white transition-all disabled:opacity-20"
              >
                {loading.receive ? <Activity className="w-4 h-4 animate-spin" /> : 'Sync Global ledger'}
              </button>
            </div>

            {/* Audit Log */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#141414] pb-3">
                <span className="font-mono text-[11px] uppercase font-bold tracking-widest">Audit_Trail</span>
                <span className="text-[9px] font-mono opacity-30 italic">Last 5 Sessions</span>
              </div>
              
              <div className="divide-y divide-[#141414]/5">
                {txHistory.length === 0 ? (
                  <div className="py-12 text-center text-[10px] uppercase font-mono opacity-20 tracking-tighter">no_ledger_activity_recorded</div>
                ) : (
                  txHistory.map((tx) => (
                    <div key={tx.id} className="py-4 flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${tx.type === 'mint' ? 'bg-blue-400' : 'bg-[#141414]'}`} />
                        <div>
                          <p className="font-mono font-bold uppercase text-[10px] leading-tight">{tx.type}</p>
                          <p className="text-[9px] font-mono opacity-30 tracking-tight">{tx.time} — id.{tx.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="font-sans font-bold text-sm tracking-tight block">
                          {tx.type === 'send' ? '-' : '+'}{tx.amount}
                         </span>
                         <span className="text-[9px] font-mono opacity-30 uppercase italic"> dust</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="mt-32 p-12 border-t border-[#141414]/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[9px] uppercase opacity-30 tracking-[0.3em]">
            Midnight Protocol × Compact Specification
          </p>
          <div className="flex gap-6 opacity-30 font-mono text-[9px] uppercase tracking-widest">
            <a href="#" className="hover:opacity-100 italic transition-opacity">Explorer</a>
            <a href="#" className="hover:opacity-100 italic transition-opacity">Docs</a>
            <a href="#" className="hover:opacity-100 italic transition-opacity">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

