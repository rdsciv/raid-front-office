import React from 'react';
import {
  X,
  Trash2,
  Download,
  Package,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Minus,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { GradingBatchItem, MarketParameters } from '../lib/types';
import {
  calculateGradingBatchSummary,
  formatCurrency,
  formatPercent,
} from '../lib/calculations';

interface BatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batchItems: GradingBatchItem[];
  parameters: MarketParameters;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearBatch: () => void;
}

export const BatchDrawer: React.FC<BatchDrawerProps> = ({
  isOpen,
  onClose,
  batchItems,
  parameters,
  onUpdateQuantity,
  onRemoveItem,
  onClearBatch,
}) => {
  if (!isOpen) return null;

  const summary = calculateGradingBatchSummary(batchItems, parameters);

  // CSV Export for PSA Submission Manifest
  const exportBatchManifestCSV = () => {
    if (batchItems.length === 0) return;

    const headers = [
      'Line Item',
      'Player Name',
      'Position',
      'Team',
      'Year',
      'Card Set',
      'Variation',
      'Card #',
      'Quantity',
      'Raw Cost/Card',
      'PSA 10 Comp',
      'Declared Insurance Value/Card',
      'Expected Profit/Card',
      'Projected ROI %',
    ];

    const rows = batchItems.map((item, idx) => [
      idx + 1,
      `"${item.player.name}"`,
      item.player.position,
      item.player.team,
      item.card.year,
      `"${item.card.set}"`,
      `"${item.card.variation}"`,
      item.card.card_number,
      item.quantity,
      item.calculated.rawCost.toFixed(2),
      item.card.comps.psa_10_median.toFixed(2),
      item.card.comps.psa_10_median.toFixed(2), // Declared value for insurance
      item.calculated.expectedNetProfit.toFixed(2),
      item.calculated.roiPct.toFixed(1) + '%',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `psa_submission_manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100">
          {/* Header */}
          <div className="p-5 md:p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-white tracking-wide flex items-center gap-2">
                  <span>Grading Submission Batch</span>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                    {summary.totalCards} Cards
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Institutional portfolio allocation & PSA manifest generator
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {batchItems.length > 0 && (
                <button
                  onClick={onClearBatch}
                  title="Clear all cards from batch"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
            {batchItems.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3">
                <Package className="w-12 h-12 mx-auto text-slate-700" />
                <div className="text-sm font-semibold text-slate-300">
                  Submission Batch is Empty
                </div>
                <p className="text-xs max-w-xs mx-auto text-slate-500">
                  Click the <strong>+ Batch</strong> button on any card in the screener table to model aggregate portfolio grading capital and returns.
                </p>
              </div>
            ) : (
              <>
                {/* Portfolio Summary Dashboard Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
                    <span className="font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Aggregate Portfolio Capital & EV
                    </span>
                    <span className="font-mono text-cyan-400">
                      Tier: {formatCurrency(parameters.gradingFee)}/card
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Total Capital</span>
                      <span className="text-sm font-bold text-white">
                        {formatCurrency(summary.totalCapitalOutlay)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Expected Profit</span>
                      <span
                        className={`text-sm font-bold ${
                          summary.expectedNetProfit > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {summary.expectedNetProfit > 0 ? '+' : ''}
                        {formatCurrency(summary.expectedNetProfit)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Blended ROI</span>
                      <span
                        className={`text-sm font-bold ${
                          summary.blendedRoiPct > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatPercent(summary.blendedRoiPct, 1, true)}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Avg Gem Rate</span>
                      <span className="text-sm font-bold text-cyan-400">
                        {formatPercent(summary.blendedGemRate * 100, 1)}
                      </span>
                    </div>
                  </div>

                  {/* Downside vs Upside Scenarios */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between font-mono">
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        Worst Case (All 9s):
                      </span>
                      <span className={summary.worstCaseDownside >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatCurrency(summary.worstCaseDownside)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between font-mono">
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Best Case (All 10s):
                      </span>
                      <span className="text-emerald-400 font-bold">
                        +{formatCurrency(summary.bestCaseUpside)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card List in Batch */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Allocated Card Items ({batchItems.length})
                  </div>

                  {batchItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate">
                            {item.player.name}
                          </span>
                          <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
                            {item.player.position} · {item.player.team}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono mt-0.5 truncate">
                          {item.card.set} {item.card.variation} #{item.card.card_number}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3 font-mono">
                          <span>Raw: {formatCurrency(item.calculated.rawCost)}</span>
                          <span>•</span>
                          <span>PSA 10: {formatCurrency(item.card.comps.psa_10_median)}</span>
                          <span>•</span>
                          <span className="text-emerald-400">
                            EV: +{formatCurrency(item.calculated.expectedNetProfit)}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                            className="p-1 hover:text-white disabled:opacity-30 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-white text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer with CSV Export */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Continue Screening
            </button>

            <button
              onClick={exportBatchManifestCSV}
              disabled={batchItems.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export PSA Manifest (CSV)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
