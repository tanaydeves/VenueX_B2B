import React, { useState } from 'react';
import { Coins, CheckCircle, ShieldCheck, Zap, AlertCircle, Building2 } from 'lucide-react';
import { getPlatformConfig } from '../config/platformConfig';
import { marketplaceService } from '../services/marketplaceService';

interface BuyExtraDTModalProps {
  isOpen: boolean;
  onClose: () => void;
  seekerId: string;
  currentBalance: number;
  onSuccess?: (newBalance: number) => void;
}

export const BuyExtraDTModal: React.FC<BuyExtraDTModalProps> = ({
  isOpen,
  onClose,
  seekerId,
  currentBalance,
  onSuccess,
}) => {
  const config = getPlatformConfig();
  const packs = config.extraTokenPacks;

  const [selectedPackId, setSelectedPackId] = useState<string>(packs[1]?.id || packs[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<string>('Corporate NetBanking (HDFC/ICICI)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<{ amount: number; newBalance: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedPack = packs.find(p => p.id === selectedPackId) || packs[0];

  const handlePurchase = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await marketplaceService.purchaseExtraDT(seekerId, selectedPack.id, paymentMethod);

      if (res.success && res.entry) {
        setSuccessResult({
          amount: res.entry.amount,
          newBalance: res.currentBalance,
        });
        if (onSuccess) {
          onSuccess(res.currentBalance);
        }
      } else {
        setErrorMessage(res.error || 'Failed to complete Extra D.T. top-up.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during simulated top-up.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSuccessResult(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1220]/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Prototype Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="uppercase tracking-wider">Prototype / Simulated Payment</span>
          </div>
          <span className="text-[10px] bg-amber-200/60 text-amber-900 font-mono px-2 py-0.5 rounded">
            HACKATHON MVP
          </span>
        </div>

        {/* Modal Header */}
        <div className="p-6 bg-[#0B1220] text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-400/30 rounded-xl text-amber-400">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Purchase Extra Delivery Tokens (D.T.)</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Current Balance: <span className="font-semibold text-amber-400">{currentBalance} D.T.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {successResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">Tokens Purchased Successfully!</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Added <strong className="text-emerald-700">+{successResult.amount} D.T.</strong> to your account balance.
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                <span className="text-xs text-gray-500 uppercase tracking-wider block">Updated Balance</span>
                <span className="text-3xl font-black text-emerald-800">{successResult.newBalance} D.T.</span>
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 p-2.5 rounded-lg flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gray-600" />
                <span>Simulated payment ledger updated. Prototype transaction completed.</span>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-[#0B1220] hover:bg-[#111827] text-white font-semibold rounded-xl transition-all shadow-md mt-4"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Select Token Pack */}
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-3">
                  Select Delivery Token Pack
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {packs.map((pack) => {
                    const isSelected = pack.id === selectedPackId;
                    return (
                      <div
                        key={pack.id}
                        onClick={() => setSelectedPackId(pack.id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/40 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-amber-600 bg-amber-600' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{pack.name}</span>
                              {pack.badge && (
                                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase">
                                  {pack.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {pack.tokenAmount} Delivery Tokens (D.T.)
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-black text-gray-900">
                            ₹{pack.price.toLocaleString('en-IN')}
                          </span>
                          <span className="block text-[11px] text-gray-400">
                            ₹{Math.round(pack.price / pack.tokenAmount)} / D.T.
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-2">
                  Payment Method (Simulated)
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="bg-transparent w-full focus:outline-none cursor-pointer"
                  >
                    <option value="Corporate NetBanking (HDFC/ICICI)">Corporate NetBanking (HDFC/ICICI)</option>
                    <option value="UPI Corporate (GPay/PhonePe)">UPI Corporate (GPay / PhonePe)</option>
                    <option value="Business Credit Card">Business Credit Card (Visa/MasterCard)</option>
                  </select>
                </div>
              </div>

              {/* Order Summary & Prototype Badge */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Selected Pack:</span>
                  <span className="font-semibold text-gray-900">{selectedPack?.name}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Tokens Added:</span>
                  <span className="font-bold text-amber-600">+{selectedPack?.tokenAmount} D.T.</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-gray-900">
                  <span>Total Amount (Inc. GST):</span>
                  <span className="text-gray-900">₹{selectedPack?.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-1/3 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePurchase}
                  className="w-2/3 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Simulating Top-Up...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Top Up {selectedPack?.tokenAmount} D.T. Now</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-center text-gray-400">
                🔒 All top-ups run through VenueX prototype payment abstraction. No real funds charged.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
