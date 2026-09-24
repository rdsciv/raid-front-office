import React from 'react';
import { X, TrendingUp, ShieldCheck, DollarSign, Clock, AlertTriangle, CheckCircle, ChevronRight, Zap } from 'lucide-react';
import { Client } from '../types/game';
import { audio } from '../engine/audioEngine';

interface WarRoomModalProps {
  client: Client;
  onClose: () => void;
  onEnterNegotiation: (client: Client) => void;
}

export const WarRoomModal: React.FC<WarRoomModalProps> = ({
  client,
  onClose,
  onEnterNegotiation
}) => {
  const { warRoom } = client;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0e1626] border border-[#233554] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-cyan-950/40 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1c2c47] bg-[#121c30] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 font-mono text-xs font-bold border border-cyan-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>RAID EVIDENCE WAR ROOM</span>
            </div>
            <div className="text-slate-400 text-xs font-mono">DOSSIER REF: #{client.id.toUpperCase()}</div>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1c2c47] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Client Bio Header Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#142038] to-[#10192e] border border-[#233554] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {client.headshotUrl ? (
                <div className="w-16 h-16 rounded-xl bg-[#17233c] border border-cyan-500/40 overflow-hidden relative shadow-lg shrink-0">
                  <img 
                    src={client.headshotUrl} 
                    alt={client.name} 
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute bottom-0 right-0 bg-black/85 px-1 font-mono text-[9px] font-bold text-cyan-400">
                    {client.position}
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#1b2b4a] border border-cyan-500/40 flex items-center justify-center font-display text-2xl font-bold text-cyan-400 shadow-lg shrink-0">
                  {client.position}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-display font-bold text-white">{client.name}</h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                    Age {client.age}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800 flex items-center gap-1">
                    {client.teamLogoUrl && <img src={client.teamLogoUrl} alt={client.team} className="w-3.5 h-3.5 object-contain" />}
                    <span>{client.team}</span>
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                    client.tier === 'STAR' ? 'bg-amber-950/80 text-amber-300 border-amber-700/60' :
                    client.tier === 'JOURNEYMAN' ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60' :
                    'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  }`}>
                    {client.tier === 'STAR' ? '⭐ STAR' : client.tier === 'JOURNEYMAN' ? '🛠️ JOURNEYMAN' : '⚡ ROOKIE'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono border border-emerald-700">
                    SPOTRAC VERIFIED
                  </span>
                </div>
                {client.situationalTag && (
                  <div className="mt-1 text-[11px] font-mono text-amber-300 bg-[#0a1120] px-2 py-0.5 rounded border border-[#1d2d4d] inline-block">
                    ⚡ {client.situationalTag}
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {client.positionFull} • Scheme: <span className="text-cyan-400 font-semibold">{client.schemeType}</span> (Fit: {client.schemeFitScore}/100)
                  {client.college && <span> • College: <span className="text-slate-300">{client.college}</span></span>}
                </p>
              </div>
            </div>

            {/* Key Metrics Ribbon */}
            <div className="flex items-center gap-3">
              {warRoom.keyStats.map((stat, idx) => (
                <div key={idx} className="px-3 py-1.5 rounded-lg bg-[#0c1322] border border-[#1e2f4f] text-center">
                  <div className="text-[10px] text-slate-400 font-mono">{stat.label}</div>
                  <div className="font-mono font-bold text-cyan-300 text-sm">{stat.value}</div>
                  {stat.rank && <div className="text-[9px] text-emerald-400 font-semibold">{stat.rank}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* 1. Thesis Statement */}
          <div className="p-4 rounded-xl bg-[#121d33] border-l-4 border-l-cyan-400 border border-[#223352]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold mb-1">
              RAID THESIS STATEMENT
            </div>
            <p className="text-slate-100 font-medium italic text-base leading-relaxed">
              "{warRoom.thesisStatement}"
            </p>
          </div>

          {/* 2-Column Grid: Leverage Clock & Replacement Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* The Leverage Clock */}
            <div className="p-4 rounded-xl bg-[#101a2e] border border-[#203150] space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono text-xs">
                <Clock className="w-4 h-4" />
                <span>THE LEVERAGE CLOCK (CATALYST TIMELINE)</span>
              </div>
              <ul className="space-y-2.5">
                {warRoom.leverageTimeline.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="h-5 w-5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Replacement Cost & Option Value Model */}
            <div className="p-4 rounded-xl bg-[#101a2e] border border-[#203150] space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold font-mono text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>REPLACEMENT COST & OPTION VALUE</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-[#0c1424] border border-[#1b2a47]">
                  <span className="text-slate-400 font-mono block text-[10px]">DRAFT CAPITAL BURDEN:</span>
                  <span className="text-rose-300 font-medium">{warRoom.replacementCost.draftCapitalCost}</span>
                </div>
                <div className="p-2 rounded bg-[#0c1424] border border-[#1b2a47]">
                  <span className="text-slate-400 font-mono block text-[10px]">ROOKIE VARIANCE EXPOSURE:</span>
                  <span className="text-amber-300 font-medium">{warRoom.replacementCost.rookieVarianceDelta}</span>
                </div>
                <div className="p-2 rounded bg-[#0c1424] border border-[#1b2a47]">
                  <span className="text-slate-400 font-mono block text-[10px]">QB & SCHEME PERFORMANCE DELTA:</span>
                  <span className="text-emerald-300 font-medium">{warRoom.replacementCost.qbPressureDelta}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. The Ask Shape Blueprint */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#121c33] to-[#0c1324] border border-cyan-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                <span>THE ASK BLUEPRINT (TARGET ARCHITECTURE)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Targeting Top 5 Positional Tier</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1f2e4c] text-center">
                <div className="text-[10px] text-slate-400 font-mono">TERM</div>
                <div className="text-lg font-bold text-white font-mono">{warRoom.targetAsk.term} Years</div>
                <div className="text-[10px] text-slate-400">Full term</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1f2e4c] text-center">
                <div className="text-[10px] text-slate-400 font-mono">TOTAL VALUE / AAV</div>
                <div className="text-lg font-bold text-cyan-400 font-mono">${warRoom.targetAsk.aav}M</div>
                <div className="text-[10px] text-slate-400">${warRoom.targetAsk.totalValue}M Total</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1f2e4c] text-center">
                <div className="text-[10px] text-slate-400 font-mono">PRACTICAL GUARANTEES</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">${warRoom.targetAsk.practicalGuarantees}M</div>
                <div className="text-[10px] text-slate-400">
                  {Math.round((warRoom.targetAsk.practicalGuarantees / warRoom.targetAsk.totalValue) * 100)}% of total
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0a0f1d] border border-[#1f2e4c] text-center">
                <div className="text-[10px] text-slate-400 font-mono">YR 1 CASH FLOW</div>
                <div className="text-lg font-bold text-amber-400 font-mono">{warRoom.targetAsk.firstYearCashFlowPct}%</div>
                <div className="text-[10px] text-slate-400">Front-loaded</div>
              </div>
            </div>
          </div>

          {/* Historical Comparables */}
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              MARKET BENCHMARKS & RECENT PRECEDENTS
            </div>
            <div className="overflow-x-auto rounded-lg border border-[#1c2c47]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#121c30] text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Player</th>
                    <th className="py-2.5 px-3">Team</th>
                    <th className="py-2.5 px-3">AAV ($M)</th>
                    <th className="py-2.5 px-3">Guarantees ($M)</th>
                    <th className="py-2.5 px-3">Year Signed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#17243c] bg-[#0c1424]">
                  {warRoom.comparables.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-[#142038]/50 transition-colors">
                      <td className="py-2 px-3 font-semibold text-white">{comp.player}</td>
                      <td className="py-2 px-3 text-slate-300 font-mono">{comp.team}</td>
                      <td className="py-2 px-3 text-cyan-400 font-mono font-bold">${comp.aav}M</td>
                      <td className="py-2 px-3 text-emerald-400 font-mono">${comp.guarantees}M</td>
                      <td className="py-2 px-3 text-slate-400">{comp.year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer / CTA */}
        <div className="px-6 py-4 border-t border-[#1c2c47] bg-[#121c30] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Target Front Office: <span className="text-white font-semibold">{client.team}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                audio.playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-[#1c2c47] transition-colors"
            >
              Close Dossier
            </button>
            <button
              onClick={() => {
                audio.playTacticalStrike();
                onEnterNegotiation(client);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            >
              <span>Engage Front Office</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
