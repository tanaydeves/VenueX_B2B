import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Cpu, 
  X, 
  CheckCircle2, 
  Layers, 
  MapPin, 
  Calendar, 
  Truck, 
  ShieldCheck, 
  Clock, 
  RefreshCw,
  Award,
  ChevronRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { aiService, MatchExplanationResult } from '../services/aiService';
import { ResourceListing, MatchScoreResult } from '../types';

interface AiMatchExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ResourceListing | null;
  matchResult: MatchScoreResult | null;
  requestedQty?: number;
  requestedDates?: { start: string; end: string };
}

export const AiMatchExplanationModal: React.FC<AiMatchExplanationModalProps> = ({
  isOpen,
  onClose,
  resource,
  matchResult,
  requestedQty = 100,
  requestedDates = { start: '2026-10-01', end: '2026-10-04' },
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [aiExplanation, setAiExplanation] = useState<MatchExplanationResult | null>(null);

  const loadExplanation = async () => {
    if (!resource || !matchResult) return;
    setLoading(true);
    try {
      const res = await aiService.explainMatch(
        resource,
        {
          quantity: requestedQty,
          startDate: requestedDates.start,
          endDate: requestedDates.end,
          maxBudget: resource.pricePerUnitPerDay * 1.2,
          seekerLocation: 'Vashi, Navi Mumbai',
        },
        matchResult.score
      );
      setAiExplanation(res);
    } catch (e) {
      console.error('Error generating AI match explanation:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && resource && matchResult) {
      loadExplanation();
    }
  }, [isOpen, resource?.id, matchResult?.score]);

  if (!isOpen || !resource || !matchResult) return null;

  const breakdownItems = [
    { label: 'Category & Asset Affinity', value: matchResult.breakdown.categoryMatch, weight: '25%' },
    { label: 'Quantity & Reserve Capacity', value: matchResult.breakdown.quantityMatch, weight: '20%' },
    { label: 'Date Window Feasibility', value: matchResult.breakdown.dateAvailability, weight: '20%' },
    { label: 'Geographic Transit Corridor', value: matchResult.breakdown.distanceProximity, weight: '15%' },
    { label: 'Price & Budget Compliance', value: matchResult.breakdown.priceFit, weight: '10%' },
    { label: 'Logistics Dock Alignment', value: matchResult.breakdown.deliveryAlignment, weight: '10%' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 text-gray-900">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Nugen Domain Match Analysis
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Cpu className="w-3 h-3" />
                  Aligned Model
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Evaluating compatibility for {resource.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Pipeline Banner */}
        <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
          <span className="text-gray-300">
            Model: <strong className="text-emerald-400 font-mono">{aiExplanation?.modelId || 'venuex-hospitality-domain-v1'}</strong>
          </span>
          <span className="text-amber-300 font-semibold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            Domain Alignment: Active
          </span>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Main Score Hero Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                VenueX Compatibility Score
              </span>
              <h3 className="text-xl font-bold text-gray-900">{resource.name}</h3>
              <p className="text-xs text-gray-600 flex items-center gap-2 justify-center sm:justify-start">
                <span>{resource.location}</span>
                <span>•</span>
                <span>₹{resource.pricePerUnitPerDay}/unit/day</span>
              </p>
            </div>

            <div className="flex flex-col items-center justify-center bg-white px-6 py-4 rounded-xl border border-blue-200 shadow-sm">
              <span className="text-3xl font-extrabold text-blue-600 font-mono">
                {matchResult.score}%
              </span>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                Match Index
              </span>
            </div>
          </div>

          {/* AI Domain Explanation Box */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Domain AI Reasoning & Synthesis
                </span>
              </div>
              <button
                onClick={loadExplanation}
                disabled={loading}
                className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-gray-300">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                <p className="text-xs">Evaluating domain vectors with Nugen aligned model...</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-100 leading-relaxed font-medium">
                  {aiExplanation?.explanation}
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Operational Procurement Details:
                  </span>
                  {aiExplanation?.reasoningBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 6-Dimension Compatibility Vector Breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Deterministic Compatibility Vectors (6-D Breakdown)
            </h4>

            <div className="space-y-2.5">
              {breakdownItems.map((item, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                  <div className="flex items-center justify-between mb-1.5 font-medium">
                    <span className="text-gray-700">{item.label} <span className="text-gray-400 font-normal">({item.weight})</span></span>
                    <span className={`font-mono font-bold ${item.value >= 80 ? 'text-emerald-600' : item.value >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {item.value}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.value >= 80 ? 'bg-emerald-500' : item.value >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
