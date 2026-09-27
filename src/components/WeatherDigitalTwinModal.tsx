import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  Wind, 
  SunMedium, 
  Waves, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldAlert, 
  X, 
  Cpu, 
  Activity,
  ArrowRight,
  RefreshCw,
  Truck,
  Building,
  Layers
} from 'lucide-react';
import { aiService, WeatherConditionParams, OperationalState, WeatherImpactResult } from '../services/aiService';
import { ResourceListing } from '../types';

interface WeatherDigitalTwinModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedResource?: ResourceListing | null;
}

type PresetCondition = 'MONSOON_HEAVY_RAIN' | 'CYCLONIC_STORM' | 'EXTREME_HEAT' | 'COASTAL_FLOOD' | 'CLEAR_NORMAL';

export const WeatherDigitalTwinModal: React.FC<WeatherDigitalTwinModalProps> = ({
  isOpen,
  onClose,
  selectedResource,
}) => {
  const [activeCondition, setActiveCondition] = useState<PresetCondition>('MONSOON_HEAVY_RAIN');
  const [precipitation, setPrecipitation] = useState<number>(65); // mm/hr
  const [windSpeed, setWindSpeed] = useState<number>(45); // km/h
  const [temperature, setTemperature] = useState<number>(28); // Celsius
  const [selectedZone, setSelectedZone] = useState<string>('Navi Mumbai / Panvel Corridor');

  const [loading, setLoading] = useState<boolean>(false);
  const [impactResult, setImpactResult] = useState<WeatherImpactResult | null>(null);

  // Compute operational deltas based on state
  const computeOperationalStates = (cond: PresetCondition) => {
    const beforeState: OperationalState = {
      effectiveAvailability: 100,
      transitRiskScore: 12,
      demandSurgePercent: 0,
      estimatedDeliveryBufferMin: 15,
    };

    let afterState: OperationalState = {
      effectiveAvailability: 100,
      transitRiskScore: 12,
      demandSurgePercent: 0,
      estimatedDeliveryBufferMin: 15,
    };

    switch (cond) {
      case 'MONSOON_HEAVY_RAIN':
        afterState = {
          effectiveAvailability: 45,
          transitRiskScore: 78,
          demandSurgePercent: 55,
          estimatedDeliveryBufferMin: 50,
        };
        break;
      case 'CYCLONIC_STORM':
        afterState = {
          effectiveAvailability: 30,
          transitRiskScore: 85,
          demandSurgePercent: 30,
          estimatedDeliveryBufferMin: 65,
        };
        break;
      case 'EXTREME_HEAT':
        afterState = {
          effectiveAvailability: 80,
          transitRiskScore: 35,
          demandSurgePercent: 40,
          estimatedDeliveryBufferMin: 25,
        };
        break;
      case 'COASTAL_FLOOD':
        afterState = {
          effectiveAvailability: 20,
          transitRiskScore: 92,
          demandSurgePercent: 70,
          estimatedDeliveryBufferMin: 90,
        };
        break;
      case 'CLEAR_NORMAL':
      default:
        afterState = {
          effectiveAvailability: 100,
          transitRiskScore: 10,
          demandSurgePercent: 0,
          estimatedDeliveryBufferMin: 15,
        };
        break;
    }

    return { beforeState, afterState };
  };

  const runSimulation = async (cond: PresetCondition) => {
    setLoading(true);
    const { beforeState, afterState } = computeOperationalStates(cond);

    const targetEntity = selectedResource || {
      name: 'Regional Hospitality Resource Fleet',
      category: 'Multi-Category Fleet',
      location: selectedZone,
    };

    const weatherParams: WeatherConditionParams = {
      condition: cond,
      precipitationMmPerHr: precipitation,
      windSpeedKmh: windSpeed,
      temperatureCelsius: temperature,
      locationZone: selectedZone,
    };

    try {
      const res = await aiService.explainWeatherImpact(targetEntity, weatherParams, beforeState, afterState);
      setImpactResult(res);
    } catch (e) {
      console.error('Weather digital twin simulation error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runSimulation(activeCondition);
    }
  }, [isOpen, activeCondition]);

  if (!isOpen) return null;

  const { beforeState, afterState } = computeOperationalStates(activeCondition);

  const presets = [
    {
      id: 'MONSOON_HEAVY_RAIN' as PresetCondition,
      name: 'Monsoon Rain',
      icon: CloudRain,
      badge: '>65 mm/hr',
      color: 'blue',
      precip: 70,
      wind: 35,
      temp: 26,
    },
    {
      id: 'CYCLONIC_STORM' as PresetCondition,
      name: 'Cyclonic Storm',
      icon: Wind,
      badge: '>50 km/h Gusts',
      color: 'purple',
      precip: 45,
      wind: 58,
      temp: 24,
    },
    {
      id: 'EXTREME_HEAT' as PresetCondition,
      name: 'Extreme Heat',
      icon: SunMedium,
      badge: '>42°C Spoilage',
      color: 'amber',
      precip: 0,
      wind: 12,
      temp: 42,
    },
    {
      id: 'COASTAL_FLOOD' as PresetCondition,
      name: 'Flash Flood',
      icon: Waves,
      badge: 'Turbhe / Panvel',
      color: 'rose',
      precip: 95,
      wind: 40,
      temp: 25,
    },
    {
      id: 'CLEAR_NORMAL' as PresetCondition,
      name: 'Clear Baseline',
      icon: CheckCircle2,
      badge: 'Optimal SLA',
      color: 'emerald',
      precip: 0,
      wind: 10,
      temp: 29,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 text-gray-900">
        
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Weather Digital Twin — What-If Simulator</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Cpu className="w-3 h-3" />
                  Nugen Aligned AI
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Predictive environmental shock modeling for Mumbai & Navi Mumbai hospitality operations
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

        {/* Model Provenance Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300">Pipeline:</strong> Base Model (<code className="bg-black/40 px-1.5 py-0.5 rounded text-gray-200">Meta-Llama-3-8B-Instruct</code>) → <strong className="text-blue-300">Nugen Domain Alignment</strong> → <strong className="text-emerald-300">venuex-hospitality-domain-v1</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Aligned Model ID: {impactResult?.modelId || 'venuex-hospitality-domain-v1'}</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Target Resource / Context */}
          {selectedResource && (
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Building className="w-4 h-4 text-blue-600" />
                <span>
                  Simulating impact for: <strong className="text-gray-900 font-semibold">{selectedResource.name}</strong> ({selectedResource.category})
                </span>
              </div>
              <span className="text-gray-500">Location: <strong>{selectedResource.location}</strong></span>
            </div>
          )}

          {/* Preset Weather Conditions Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
              Select Synthetic Weather Condition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {presets.map(p => {
                const Icon = p.icon;
                const isSelected = activeCondition === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveCondition(p.id);
                      setPrecipitation(p.precip);
                      setWindSpeed(p.wind);
                      setTemperature(p.temp);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.badge}
                      </span>
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-blue-950' : 'text-gray-800'}`}>
                        {p.name}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                <span>Rainfall Precipitation</span>
                <span className="font-bold font-mono text-blue-600">{precipitation} mm/hr</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                value={precipitation}
                onChange={(e) => setPrecipitation(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-[10px] text-gray-400">Low (&lt;10mm) → Flash Flooding (&gt;65mm)</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                <span>Wind Velocity</span>
                <span className="font-bold font-mono text-purple-600">{windSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={windSpeed}
                onChange={(e) => setWindSpeed(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <span className="text-[10px] text-gray-400">Breeze (&lt;15km) → Cyclonic Shear (&gt;50km)</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                <span>Ambient Temperature</span>
                <span className="font-bold font-mono text-amber-600">{temperature} °C</span>
              </div>
              <input
                type="range"
                min="18"
                max="48"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <span className="text-[10px] text-gray-400">Moderate (24°C) → Extreme Heat (&gt;40°C)</span>
            </div>
          </div>

          {/* Before vs After Telemetry Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Digital Twin Operational Telemetry Deltas
              </label>
              <button
                onClick={() => runSimulation(activeCondition)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Recalculate AI Model</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Metric 1: Effective Availability */}
              <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                  <span>Asset Availability</span>
                  <Building className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">{afterState.effectiveAvailability}%</span>
                  <span className={`text-xs font-semibold flex items-center ${
                    afterState.effectiveAvailability < 100 ? 'text-rose-600' : 'text-emerald-600'
                  }`}>
                    {afterState.effectiveAvailability < 100 ? (
                      <>
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                        {afterState.effectiveAvailability - beforeState.effectiveAvailability}%
                      </>
                    ) : '100%'}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      afterState.effectiveAvailability > 70 ? 'bg-emerald-500' : afterState.effectiveAvailability > 40 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${afterState.effectiveAvailability}%` }}
                  ></div>
                </div>
              </div>

              {/* Metric 2: Transit Risk Score */}
              <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                  <span>Transit Risk</span>
                  <Truck className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-xl font-bold ${
                    afterState.transitRiskScore > 70 ? 'text-rose-600' : afterState.transitRiskScore > 40 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {afterState.transitRiskScore}/100
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {afterState.transitRiskScore > 70 ? 'Severe' : afterState.transitRiskScore > 40 ? 'Moderate' : 'Nominal'}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      afterState.transitRiskScore > 70 ? 'bg-rose-500' : afterState.transitRiskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${afterState.transitRiskScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Metric 3: Demand Surge */}
              <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                  <span>Indoor Demand Surge</span>
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-indigo-900">+{afterState.demandSurgePercent}%</span>
                  <span className="text-xs font-semibold text-indigo-600">Surge Index</span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, afterState.demandSurgePercent * 1.4)}%` }}
                  ></div>
                </div>
              </div>

              {/* Metric 4: Logistics Buffer */}
              <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                  <span>Logistics SLA Buffer</span>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-gray-900">+{afterState.estimatedDeliveryBufferMin}m</span>
                  <span className="text-xs font-medium text-gray-500">Route delay</span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (afterState.estimatedDeliveryBufferMin / 90) * 100)}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

          {/* Domain-Aligned AI Narration Box */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-indigo-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cpu className="w-36 h-36" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Domain-Aligned AI Impact Narration
                  </span>
                </div>
                <span className="text-[11px] font-mono text-gray-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                  {impactResult?.modelId || 'Nugen Model'}
                </span>
              </div>

              {loading ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2 text-gray-300">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                  <p className="text-xs">Querying Nugen domain-aligned model with environmental vector telemetry...</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-100 leading-relaxed font-medium">
                    {impactResult?.summary}
                  </p>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-gray-300 space-y-1">
                    <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Critical Hazard Assessment:
                    </span>
                    <p className="text-gray-200 leading-relaxed">
                      {impactResult?.riskAssessment}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-300 block mb-1.5 uppercase tracking-wide">
                      Automated Operational Mitigation Protocols:
                    </span>
                    <div className="space-y-1.5">
                      {impactResult?.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Real-time inference integrated into VenueX matching and dispatch</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
          >
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
};
