import React, { useEffect, useState } from 'react';
import { History, ArrowDownLeft, ArrowUpRight, PlusCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { mockTokenService } from '../services/tokenService';
import { DeliveryTokenLedgerEntry } from '../types';

interface TokenLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  seekerId: string;
}

export const TokenLedgerModal: React.FC<TokenLedgerModalProps> = ({
  isOpen,
  onClose,
  seekerId,
}) => {
  const [history, setHistory] = useState<DeliveryTokenLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      mockTokenService.getLedgerHistory(seekerId).then((data) => {
        setHistory(data);
        setLoading(false);
      });
    }
  }, [isOpen, seekerId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1220]/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-[#0B1220] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Delivery Token (D.T.) Audit Ledger</h3>
              <p className="text-xs text-slate-300">Complete immutable record of token grants, consumptions & top-ups</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Prototype Notice */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-800">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Prototype Audit Log:</strong> D.T. tokens are held in a 1:1 fixed credit ledger. Consumed per delivery order.
          </span>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Loading ledger entries...
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              No token transaction history found for this account.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => {
                const isPositive = entry.amount > 0;
                let Icon = ArrowDownLeft;
                let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                let typeLabel: string = entry.type;

                if (entry.type === 'GRANT') {
                  Icon = PlusCircle;
                  typeLabel = 'Subscription Grant';
                  badgeStyle = 'bg-blue-100 text-blue-800 border-blue-300';
                } else if (entry.type === 'CONSUME') {
                  Icon = ArrowUpRight;
                  typeLabel = 'Logistics Consumption';
                  badgeStyle = 'bg-gray-100 text-gray-800 border-gray-300';
                } else if (entry.type === 'EXTRA_PURCHASE') {
                  Icon = PlusCircle;
                  typeLabel = 'Extra D.T. Top-Up';
                  badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
                } else if (entry.type === 'REFUND') {
                  Icon = RotateCcw;
                  typeLabel = 'Token Refund';
                  badgeStyle = 'bg-purple-100 text-purple-800 border-purple-300';
                }

                return (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50/50 flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isPositive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeStyle}`}>
                            {typeLabel}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(entry.createdAt).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-gray-800 mt-1">
                          {entry.notes}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-base font-black ${
                          isPositive ? 'text-emerald-600' : 'text-gray-900'
                        }`}
                      >
                        {isPositive ? `+${entry.amount}` : entry.amount} D.T.
                      </span>
                      <span className="block text-[11px] text-gray-400 font-mono">
                        Balance after: {entry.balanceAfter} D.T.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#111827] hover:bg-[#0B1220] text-white font-semibold text-xs rounded-lg transition-all"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
