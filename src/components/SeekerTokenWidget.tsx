import React, { useEffect, useState } from 'react';
import { Coins, Plus, History, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { subscribeToDatabase } from '../db/database';
import { mockTokenService } from '../services/tokenService';
import { BuyExtraDTModal } from './BuyExtraDTModal';
import { TokenLedgerModal } from './TokenLedgerModal';

interface SeekerTokenWidgetProps {
  seekerId: string;
}

export const SeekerTokenWidget: React.FC<SeekerTokenWidgetProps> = ({ seekerId }) => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);

  const refreshBalance = () => {
    mockTokenService.getBalance(seekerId).then((bal) => {
      setBalance(bal);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshBalance();
    const unsubscribe = subscribeToDatabase(() => {
      refreshBalance();
    });
    return () => unsubscribe();
  }, [seekerId]);

  const maxAllocation = 125;
  const fillPercent = Math.min(100, Math.max(0, (balance / maxAllocation) * 100));
  const isLowBalance = balance <= 5;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
        {/* Top Accent Header */}
        <div className="bg-[#0B1220] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Delivery Tokens (D.T.)</h3>
                <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Seeker Pro Pass
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                1 D.T. per 100m distance for Porter delivery requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLedgerModalOpen(true)}
              className="p-2 bg-[#111827] hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors flex items-center gap-1.5"
              title="View Token Ledger"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Ledger</span>
            </button>
            <button
              onClick={() => setBuyModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Buy Extra D.T.</span>
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Available Token Balance
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                {loading ? (
                  <div className="w-24 h-9 bg-gray-100 rounded-lg animate-pulse" />
                ) : (
                  <>
                    <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                      {balance} <span className="text-lg font-bold text-amber-600">D.T.</span>
                    </span>
                    <span className="text-xs text-gray-500">
                      / 125 monthly allocation
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Visual Token Balance Bar */}
            <div className="w-full sm:w-48 space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-gray-500">
                <span>Usage status</span>
                <span>{balance} remaining</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isLowBalance ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Low Balance Warning Banner */}
          {isLowBalance && !loading && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>
                  <strong>Low Token Balance ({balance} D.T.):</strong> You need 1 D.T. per 100m distance for logistics delivery.
                </span>
                <button
                  onClick={() => setBuyModalOpen(true)}
                  className="text-amber-800 underline font-bold hover:text-amber-950 text-xs shrink-0"
                >
                  Top up now →
                </button>
              </div>
            </div>
          )}

          {/* Service Abstraction Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              VenueX TokenService (Mock Abstraction)
            </span>
            <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              PROTOTYPE LOGIC
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BuyExtraDTModal
        isOpen={buyModalOpen}
        onClose={() => setBuyModalOpen(false)}
        seekerId={seekerId}
        currentBalance={balance}
        onSuccess={(newBal) => setBalance(newBal)}
      />

      <TokenLedgerModal
        isOpen={ledgerModalOpen}
        onClose={() => setLedgerModalOpen(false)}
        seekerId={seekerId}
      />
    </>
  );
};
