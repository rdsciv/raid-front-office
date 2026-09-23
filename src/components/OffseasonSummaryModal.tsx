import React from 'react';
import { Trophy, Award, DollarSign, CheckCircle2, RotateCcw, X, Star } from 'lucide-react';
import { AgencyStats, Client } from '../types/game';
import { audio } from '../engine/audioEngine';

interface OffseasonSummaryModalProps {
  stats: AgencyStats;
  clients: Client[];
  onRestart: () => void;
  onClose: () => void;
}

export const OffseasonSummaryModal: React.FC<OffseasonSummaryModalProps> = ({
  stats,
  clients,
  onRestart,
  onClose
}) => {
  const signedClients = clients.filter(c => c.currentStatus === 'Signed');
  const totalGuaranteedMoney = signedClients.reduce(
    (sum, c) => sum + (c.signedContract?.practicalGuarantees || 0),
    0
  );
  const totalContractVolume = signedClients.reduce(
    (sum, c) => sum + (c.signedContract?.totalValue || 0),
    0
  );

  let tier = 'Respected Veteran';
  let tierColor = 'text-cyan-400';
  if (stats.reputation >= 90 && signedClients.length >= 3) {
    tier = 'Hall of Fame Super-Agent';
    tierColor = 'text-amber-400';
  } else if (signedClients.length >= 3) {
    tier = 'Elite Market Disrupter';
    tierColor = 'text-emerald-400';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0e1628] border border-[#233554] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Trophy Banner */}
        <div className="p-8 bg-gradient-to-b from-[#162544] to-[#0e1628] text-center border-b border-[#1f2f4c] relative">
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1f2f4c]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-amber-400 shadow-lg shadow-amber-500/20">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-slate-400">OFFSEASON PERFORMANCE AUDIT</div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            RAID AGENCY SUMMARY
          </h2>
          <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 font-mono text-xs font-bold ${tierColor}`}>
            <Star className="w-3.5 h-3.5" />
            <span>AGENT RATING: {tier}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#121c32] border border-[#1f2e4c] text-center">
              <div className="text-[10px] text-slate-400 font-mono">CONTRACTS SIGNED</div>
              <div className="text-xl font-bold text-white font-mono mt-0.5">{signedClients.length} of {clients.length}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121c32] border border-[#1f2e4c] text-center">
              <div className="text-[10px] text-slate-400 font-mono">TOTAL CASH MOVED</div>
              <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">${totalContractVolume.toFixed(1)}M</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121c32] border border-[#1f2e4c] text-center">
              <div className="text-[10px] text-slate-400 font-mono">GUARANTEES LOCKED</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">${totalGuaranteedMoney.toFixed(1)}M</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#121c32] border border-[#1f2e4c] text-center">
              <div className="text-[10px] text-slate-400 font-mono">AGENCY COMMISSION</div>
              <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">${stats.commissionRevenue.toFixed(2)}M</div>
            </div>
          </div>

          {/* Signed Deals Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase text-slate-400 font-bold">EXECUTIVE TRANSACTION LEDGER</div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {signedClients.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#10182b] border border-[#1d2b45] text-xs text-slate-400 text-center">
                  No contracts completed this offseason.
                </div>
              ) : (
                signedClients.map(c => (
                  <div key={c.id} className="p-3 rounded-lg bg-[#111a2e] border border-[#1f2e4c] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-slate-400">({c.position} • {c.team})</span>
                    </div>
                    <div className="font-mono text-cyan-300 font-bold">
                      {c.signedContract?.term} Yrs / ${c.signedContract?.totalValue}M (${c.signedContract?.practicalGuarantees}M gtd)
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-[#121c32] border-t border-[#1c2c47] flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            RAID STRATEGY SUITE • COMPLETE
          </div>
          <button
            onClick={() => {
              audio.playClick();
              onRestart();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Offseason Campaign</span>
          </button>
        </div>
      </div>
    </div>
  );
};
