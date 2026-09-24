import React, { useState } from 'react';
import { 
  Shield, 
  Activity, 
  Zap, 
  HeartHandshake, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Briefcase, 
  PlusCircle, 
  ChevronRight,
  TrendingUp,
  Percent
} from 'lucide-react';
import { Client } from '../types/game';
import { audio } from '../engine/audioEngine';

interface PortfolioViewProps {
  clients: Client[];
  onOpenWarRoom: (client: Client) => void;
  onOpenNegotiation: (client: Client) => void;
  onOpenRecruitment: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  clients,
  onOpenWarRoom,
  onOpenNegotiation,
  onOpenRecruitment
}) => {
  const [filter, setFilter] = useState<'ALL' | 'STAR' | 'JOURNEYMAN' | 'ROOKIE' | 'SIGNED'>('ALL');

  const filteredClients = clients.filter(c => {
    if (filter === 'STAR') return c.tier === 'STAR';
    if (filter === 'JOURNEYMAN') return c.tier === 'JOURNEYMAN';
    if (filter === 'ROOKIE') return c.tier === 'ROOKIE';
    if (filter === 'SIGNED') return c.currentStatus === 'Signed';
    return true;
  });

  const totalGuaranteesSecured = clients
    .filter(c => c.signedContract)
    .reduce((sum, c) => sum + (c.signedContract?.practicalGuarantees || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Portfolio Overview Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1b2b48] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide flex items-center gap-3">
            <span>CLIENT PORTFOLIO</span>
            <span className="text-xs px-2.5 py-1 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 font-mono">
              PRESEASON 2024
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Navigate training camp holdouts, prove-it veteran signings, and rookie wage scale battles.
          </p>
        </div>

        {/* Filter Tabs & Scout CTA */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center p-1 rounded-lg bg-[#0e1628] border border-[#203150] text-xs font-mono flex-wrap">
            <button
              onClick={() => {
                audio.playClick();
                setFilter('ALL');
              }}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                filter === 'ALL' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ALL ({clients.length})
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setFilter('STAR');
              }}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                filter === 'STAR' ? 'bg-amber-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⭐ STARS ({clients.filter(c => c.tier === 'STAR').length})
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setFilter('JOURNEYMAN');
              }}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                filter === 'JOURNEYMAN' ? 'bg-cyan-400 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              🛠️ JOURNEYMEN ({clients.filter(c => c.tier === 'JOURNEYMAN').length})
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setFilter('ROOKIE');
              }}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                filter === 'ROOKIE' ? 'bg-emerald-400 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ ROOKIES ({clients.filter(c => c.tier === 'ROOKIE').length})
            </button>
            <button
              onClick={() => {
                audio.playClick();
                setFilter('SIGNED');
              }}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                filter === 'SIGNED' ? 'bg-purple-500 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              SIGNED ({clients.filter(c => c.currentStatus === 'Signed').length})
            </button>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onOpenRecruitment();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#142038] hover:bg-[#1a2b4b] border border-[#25395f] text-cyan-300 font-semibold text-xs transition-all shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Recruit Talent</span>
          </button>
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClients.map((client) => {
          const isSigned = client.currentStatus === 'Signed';
          const isImpasse = client.currentStatus === 'Impasse';

          return (
            <div
              key={client.id}
              className={`rounded-xl border transition-all duration-300 bg-[#0f172a] shadow-xl overflow-hidden flex flex-col justify-between ${
                isSigned
                  ? 'border-emerald-500/50 shadow-emerald-950/20'
                  : isImpasse
                  ? 'border-rose-500/40 shadow-rose-950/20'
                  : 'border-[#213354] hover:border-cyan-500/40 hover:shadow-cyan-950/20'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-[#1c2c47] bg-[#121c32]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {client.headshotUrl ? (
                      <div className="w-14 h-14 rounded-xl bg-[#17233c] border border-cyan-500/40 overflow-hidden relative shadow-md shrink-0">
                        <img 
                          src={client.headshotUrl} 
                          alt={client.name} 
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                          onError={(e) => {
                            // fallback to position text if image fails
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute bottom-0 right-0 bg-black/80 px-1 font-mono text-[9px] font-bold text-cyan-400">
                          {client.position}
                        </div>
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#1b2b48] border border-cyan-500/30 flex items-center justify-center font-display font-black text-xl text-cyan-400 shadow-md shrink-0">
                        {client.position}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-display font-bold text-white">{client.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-semibold">
                          OVR {client.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        {client.teamLogoUrl && (
                          <img src={client.teamLogoUrl} alt={client.team} className="w-4 h-4 object-contain inline-block" />
                        )}
                        <span className="font-semibold text-slate-200">{client.team}</span>
                        <span>•</span>
                        <span>Age {client.age}</span>
                        {client.college && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">{client.college}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isSigned ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 text-xs font-mono font-bold border border-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>EXTENDED</span>
                      </span>
                    ) : isImpasse ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950 text-rose-300 text-xs font-mono font-bold border border-rose-700 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>IMPASSE</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 text-xs font-mono font-bold border border-cyan-700">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span>NEGOTIATING</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Tier Badge & Situational Tag */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    client.tier === 'STAR' ? 'bg-amber-950/80 text-amber-300 border-amber-700/60' :
                    client.tier === 'JOURNEYMAN' ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60' :
                    'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                  }`}>
                    {client.tier === 'STAR' ? '⭐ STAR' : client.tier === 'JOURNEYMAN' ? '🛠️ JOURNEYMAN' : '⚡ ROOKIE'}
                  </span>
                  {client.situationalTag && (
                    <span className="text-[10px] font-mono text-slate-300 bg-[#090f1d] px-2 py-0.5 rounded border border-[#1b2b48]">
                      {client.situationalTag}
                    </span>
                  )}
                </div>

                {/* Thesis Preview */}
                <div className="mt-2 text-xs text-slate-300 bg-[#090f1d] p-2.5 rounded-lg border border-[#1a2844] italic">
                  "{client.warRoom.thesisStatement}"
                </div>
              </div>

              {/* RAID Analytical Telemetry Gauges */}
              <div className="p-5 space-y-3.5 bg-[#0d1424]">
                {/* Health & Durability */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                      <span>Health & Durability</span>
                    </span>
                    <span className="text-slate-200 font-bold">{client.healthDurability}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#18233a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                      style={{ width: `${client.healthDurability}%` }}
                    />
                  </div>
                </div>

                {/* Scheme Fit Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Scheme Fit ({client.schemeType})</span>
                    </span>
                    <span className="text-cyan-300 font-bold">{client.schemeFitScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#18233a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                      style={{ width: `${client.schemeFitScore}%` }}
                    />
                  </div>
                </div>

                {/* Public Leverage Score */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Market & Public Leverage</span>
                    </span>
                    <span className="text-amber-300 font-bold">{client.publicLeverageScore}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#18233a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${client.publicLeverageScore}%` }}
                    />
                  </div>
                </div>

                {/* Patience & Trust */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <HeartHandshake className="w-3.5 h-3.5 text-purple-400" />
                      <span>Client Patience & Trust</span>
                    </span>
                    <span className="text-purple-300 font-bold">{client.patienceAndTrust}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#18233a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full"
                      style={{ width: `${client.patienceAndTrust}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Signed Deal Banner or Action Footer */}
              {isSigned && client.signedContract ? (
                <div className="px-5 py-3.5 bg-emerald-950/60 border-t border-emerald-800/60 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400">SIGNED: </span>
                    <span className="text-white font-bold">{client.signedContract.term} Yrs / ${client.signedContract.totalValue}M</span>
                    <span className="text-emerald-400 ml-2">(${client.signedContract.practicalGuarantees}M gtd)</span>
                  </div>
                  <button
                    onClick={() => {
                      audio.playClick();
                      onOpenWarRoom(client);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
                  >
                    View Terms
                  </button>
                </div>
              ) : (
                <div className="px-5 py-3.5 bg-[#121c32] border-t border-[#1c2c47] flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      audio.playClick();
                      onOpenWarRoom(client);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16233d] hover:bg-[#1d2d4d] border border-[#273b61] text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Evidence War Room</span>
                  </button>

                  <button
                    onClick={() => {
                      audio.playTacticalStrike();
                      onOpenNegotiation(client);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-bold text-xs uppercase tracking-wider shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                  >
                    <span>Battle Front Office</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
