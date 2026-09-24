import React from 'react';
import { Volume2, VolumeX, ShieldAlert, Award, DollarSign, Calendar, Users, ChevronRight, HelpCircle } from 'lucide-react';
import { AgencyStats, OffseasonPhase } from '../types/game';
import { audio } from '../engine/audioEngine';

interface HeaderProps {
  stats: AgencyStats;
  currentPhase: OffseasonPhase;
  totalPhases: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onAdvancePhase: () => void;
  onOpenRecruitment: () => void;
  onOpenBriefing: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  currentPhase,
  totalPhases,
  isMuted,
  onToggleMute,
  onAdvancePhase,
  onOpenRecruitment,
  onOpenBriefing
}) => {
  return (
    <header className="border-b border-[#1f2b45] bg-[#0c1220]/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Mission */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
            <span className="font-display font-black text-xl text-black tracking-tighter">R</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-wider text-slate-100">RAID</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 font-mono">FRONT OFFICE</span>
              <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-700/60 text-emerald-400 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>SPOTRAC + NFLVERSE LIVE</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Sports Representation & High-Leverage Contract Engine</p>
          </div>
        </div>

        {/* Agency Metrics HUD */}
        <div className="flex items-center gap-3 sm:gap-6 text-sm">
          {/* Reputation */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#131b2e] border border-[#233252]">
            <Award className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono leading-none">REPUTATION</div>
              <div className="font-bold text-amber-400 font-mono text-sm">{stats.reputation}<span className="text-slate-500 text-xs">/100</span></div>
            </div>
          </div>

          {/* Active Clients */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#131b2e] border border-[#233252]">
            <Users className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono leading-none">CLIENTS</div>
              <div className="font-bold text-cyan-400 font-mono text-sm">{stats.activeClientsCount}</div>
            </div>
          </div>

          {/* Agency Revenue (Commissions) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#131b2e] border border-[#233252]">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono leading-none">AGENCY REV (3%)</div>
              <div className="font-bold text-emerald-400 font-mono text-sm">${stats.commissionRevenue.toFixed(2)}M</div>
            </div>
          </div>
        </div>

        {/* Calendar Control & Tools */}
        <div className="flex items-center gap-3">
          {/* Phase Badge */}
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Phase {currentPhase.id + 1} of {totalPhases}</span>
            <span className="text-xs font-semibold text-slate-200">{currentPhase.name}</span>
          </div>

          {/* Advance Calendar Button */}
          <button
            onClick={() => {
              audio.playClick();
              onAdvancePhase();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-md shadow-md transition-all border border-cyan-400/30 active:scale-95"
            title="Advance to next offseason negotiation window"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Advance Week</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Agency Briefing Tutorial Button */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenBriefing();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#17223b] hover:bg-[#1f2e4f] border border-cyan-500/40 text-cyan-300 text-xs font-semibold rounded-md transition-colors shadow-sm"
            title="Open Agency Briefing & Goals"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Agency Briefing</span>
          </button>

          {/* Recruit Talent Button */}
          <button
            onClick={() => {
              audio.playClick();
              onOpenRecruitment();
            }}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-[#17223b] hover:bg-[#1f2e4f] border border-[#2b3d63] text-slate-200 text-xs font-medium rounded-md transition-colors"
          >
            <span>Scout Board</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleMute();
            }}
            className="p-2 rounded-md bg-[#131b2e] hover:bg-[#1a253f] border border-[#233252] text-slate-300 transition-colors"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
