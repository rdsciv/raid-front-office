import React from 'react';
import { X, RotateCcw, Sliders, DollarSign, Truck, Percent, Scissors, Sparkles } from 'lucide-react';
import { MarketParameters } from '../lib/types';
import { DEFAULT_PARAMETERS, formatCurrency, formatPercent } from '../lib/calculations';

interface ParameterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: MarketParameters;
  onUpdateParameters: (params: MarketParameters) => void;
}

export const ParameterDrawer: React.FC<ParameterDrawerProps> = ({
  isOpen,
  onClose,
  parameters,
  onUpdateParameters,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onUpdateParameters(DEFAULT_PARAMETERS);
  };

  const applyPreset = (preset: Partial<MarketParameters>) => {
    onUpdateParameters({
      ...parameters,
      ...preset,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
          {/* Header */}
          <div className="p-6 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-white tracking-wide">
                  Market Parameters
                </h2>
                <p className="text-xs text-slate-400">Live grading EV simulation engine</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Reset to default PSA & marketplace fees"
                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Quick Market Scenarios
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => applyPreset({ gradingFee: 19.0, shippingFee: 3.5, sellerFeePct: 13.25, gemRateHaircutPct: 0 })}
                  className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-left transition-all"
                >
                  <div className="font-semibold text-slate-200">PSA Value Bulk</div>
                  <div className="text-[11px] text-slate-400">$19/card · 13.25% fee</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset({ gradingFee: 75.0, shippingFee: 5.0, sellerFeePct: 13.25, gemRateHaircutPct: 0 })}
                  className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-left transition-all"
                >
                  <div className="font-semibold text-slate-200">PSA Regular Exp.</div>
                  <div className="text-[11px] text-slate-400">$75/card (Fast turn)</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset({ gradingFee: 19.0, shippingFee: 0.0, sellerFeePct: 13.25, gemRateHaircutPct: 0 })}
                  className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-left transition-all"
                >
                  <div className="font-semibold text-slate-200">eBay Vault / Free Ship</div>
                  <div className="text-[11px] text-slate-400">$0 shipping allocation</div>
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset({ gradingFee: 19.0, shippingFee: 3.5, sellerFeePct: 13.25, gemRateHaircutPct: 20 })}
                  className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-left transition-all"
                >
                  <div className="font-semibold text-amber-300">Strict Grader (-20%)</div>
                  <div className="text-[11px] text-slate-400">20% Gem Rate haircut</div>
                </button>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Parameter 1: Grading Fee */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  Grading Fee (C<sub className="text-[10px]">grade</sub>)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {formatCurrency(parameters.gradingFee)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct submission fee per card at PSA (Bulk $19, Value $25, Regular $75).
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="150"
                  step="1"
                  value={parameters.gradingFee}
                  onChange={(e) =>
                    onUpdateParameters({ ...parameters, gradingFee: parseFloat(e.target.value) || 0 })
                  }
                  className="flex-1 accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="1"
                  value={parameters.gradingFee}
                  onChange={(e) =>
                    onUpdateParameters({ ...parameters, gradingFee: parseFloat(e.target.value) || 0 })
                  }
                  className="w-20 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md font-mono text-xs text-right text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Parameter 2: Shipping & Insurance */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  Shipping & Insurance (C<sub className="text-[10px]">ship</sub>)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {formatCurrency(parameters.shippingFee)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Allocated round-trip transit, packaging, and signature delivery per card.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={parameters.shippingFee}
                  onChange={(e) =>
                    onUpdateParameters({ ...parameters, shippingFee: parseFloat(e.target.value) || 0 })
                  }
                  className="flex-1 accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={parameters.shippingFee}
                  onChange={(e) =>
                    onUpdateParameters({ ...parameters, shippingFee: parseFloat(e.target.value) || 0 })
                  }
                  className="w-20 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md font-mono text-xs text-right text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Parameter 3: Marketplace Seller Fee % */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-cyan-400" />
                  Platform & Transaction Fee (F<sub className="text-[10px]">sell</sub>)
                </label>
                <span className="font-mono text-sm font-bold text-cyan-400">
                  {formatPercent(parameters.sellerFeePct, 2)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Combined marketplace final value fee and payment processing (eBay ~13.25%, MySlabs ~8%).
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.25"
                  value={parameters.sellerFeePct}
                  onChange={(e) =>
                    onUpdateParameters({ ...parameters, sellerFeePct: parseFloat(e.target.value) || 0 })
                  }
                  className="flex-1 accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.25"
                  value={parameters.sellerFeePct}
                  onChange={(e) =>
                    onUpdateParameters({ ...parameters, sellerFeePct: parseFloat(e.target.value) || 0 })
                  }
                  className="w-20 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md font-mono text-xs text-right text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Parameter 4: Gem Rate Haircut */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  Gem Rate Haircut Penalty
                </label>
                <span className={`font-mono text-sm font-bold ${parameters.gemRateHaircutPct > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {formatPercent(parameters.gemRateHaircutPct, 0)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Stress-test raw submissions against stricter grading standards or centering flaws.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={parameters.gemRateHaircutPct}
                  onChange={(e) =>
                    onUpdateParameters({ ...parameters, gemRateHaircutPct: parseFloat(e.target.value) || 0 })
                  }
                  className="flex-1 accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="5"
                  value={parameters.gemRateHaircutPct}
                  onChange={(e) =>
                    onUpdateParameters({ ...parameters, gemRateHaircutPct: parseFloat(e.target.value) || 0 })
                  }
                  className="w-20 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-md font-mono text-xs text-right text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* EV Logic Blueprint */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Grading EV Mathematical Model
              </h3>
              <div className="text-[11px] font-mono text-slate-400 space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-cyan-400">EV</span> = [ (P₁₀ × V₁₀ × (1 - F_sell)) + (P₉ × V₉ × (1 - F_sell)) + ((1 - P₁₀ - P₉) × V_raw × (1 - F_sell)) ] - (C_raw + C_grade + C_ship)
                </div>
                <div className="pt-1 border-t border-slate-800">
                  <span className="text-emerald-400">ROI %</span> = (EV / Total Incurred Cost) × 100
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Calculations dynamically weigh the probability of a PSA 10, PSA 9, or raw liquidation against full round-trip submission overhead.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs tracking-wide transition-colors"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
