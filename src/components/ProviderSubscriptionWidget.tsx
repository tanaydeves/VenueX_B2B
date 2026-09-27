import React, { useEffect, useState } from 'react';
import { Store, ShieldCheck, CheckCircle, CreditCard, RefreshCw, Calendar, ArrowUpRight } from 'lucide-react';
import { getPlatformConfig } from '../config/platformConfig';
import { db, subscribeToDatabase } from '../db/database';
import { PaymentRecord, SubscriptionRecord } from '../types';

interface ProviderSubscriptionWidgetProps {
  providerId: string;
}

export const ProviderSubscriptionWidget: React.FC<ProviderSubscriptionWidgetProps> = ({ providerId }) => {
  const config = getPlatformConfig();
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const sub = await db.getSubscriptionByParty(providerId);
    setSubscription(sub);

    const pmts = await db.getPaymentRecordsForParty(providerId);
    setPayments(pmts);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDatabase(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [providerId]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="bg-[#0B1220] text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Provider Enterprise Hub Subscription</h3>
              <span className="text-[10px] font-bold bg-indigo-500 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Dedicated Provider Subscription & Ledger (Separate from Seeker D.T. System)
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-[#111827] hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors"
          title="Refresh Subscription Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Plan Info */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Current Plan
            </span>
            <div className="font-bold text-base text-gray-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{subscription?.planName || 'Provider Enterprise Hub'}</span>
            </div>
            <p className="text-xs text-gray-500">
              Unlimited listing inventory + Automated Porter dispatch & escrow settlement.
            </p>
          </div>

          {/* Pricing & Cycle */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Subscription Fee
            </span>
            <div className="text-2xl font-black text-gray-900">
              ₹{config.providerSubscriptionPrice.toLocaleString('en-IN')} <span className="text-xs font-semibold text-gray-500">/ month</span>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Next billing: Oct 01, 2026 (Auto-Renew)</span>
            </div>
          </div>

          {/* Ledger Status */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Provider Ledger Status
            </span>
            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Account Ledger</span>
            </div>
            <span className="inline-block text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
              Escrow & Rental Settlements Ready
            </span>
          </div>
        </div>

        {/* Payment & Payout History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Provider Financial Ledger & Subscription Receipts
            </h4>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">
              SIMULATED LOGS
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-400 text-xs">Loading ledger...</div>
          ) : payments.length === 0 ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
              No recent payment transactions found.
            </div>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-200 text-gray-700 rounded-lg">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{p.description}</span>
                        <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold uppercase">
                          {p.simulationBadge}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {p.simulatedTransactionId} • {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-bold text-gray-900">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>VenueX Provider Ledger Service</span>
          <span className="text-gray-400">
            Provider & Seeker ledgers are maintained completely separate as per policy.
          </span>
        </div>
      </div>
    </div>
  );
};
