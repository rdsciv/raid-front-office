import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  ShieldCheck,
  Shield,
  Flame,
  Activity,
  Award,
} from 'lucide-react';
import { Position, ConfidenceTier } from '../lib/types';
import { formatDelta, formatPercent } from '../lib/calculations';

interface PositionBadgeProps {
  position: Position | string;
}

export const PositionBadge: React.FC<PositionBadgeProps> = ({ position }) => {
  const styles: Record<string, string> = {
    QB: 'bg-purple-950/70 text-purple-300 border-purple-500/40 ring-1 ring-purple-500/20',
    WR: 'bg-cyan-950/70 text-cyan-300 border-cyan-500/40 ring-1 ring-cyan-500/20',
    RB: 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/20',
    TE: 'bg-amber-950/70 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/20',
  };

  const style = styles[position] || 'bg-slate-800 text-slate-300 border-slate-600';

  return (
    <span className={`inline-flex items-center justify-center font-mono font-semibold text-xs px-2 py-0.5 rounded border shadow-sm ${style}`}>
      {position}
    </span>
  );
};

interface WoprDeltaBadgeProps {
  delta: number;
}

export const WoprDeltaBadge: React.FC<WoprDeltaBadgeProps> = ({ delta }) => {
  if (delta > 0.05) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]">
        <Flame className="w-3 h-3 text-emerald-400 animate-pulse" />
        <span className="font-semibold">{formatDelta(delta)}</span>
        <span className="text-[10px] text-emerald-400/80">3w Δ</span>
      </span>
    );
  } else if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
        <TrendingUp className="w-3 h-3 text-emerald-400" />
        <span>{formatDelta(delta)}</span>
      </span>
    );
  } else if (delta < -0.02) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full bg-rose-950/50 text-rose-300 border border-rose-500/30">
        <TrendingDown className="w-3 h-3 text-rose-400" />
        <span>{formatDelta(delta)}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
      <Minus className="w-3 h-3 text-slate-400" />
      <span>{formatDelta(delta)}</span>
    </span>
  );
};

interface SnapPctBadgeProps {
  snapPct: number;
}

export const SnapPctBadge: React.FC<SnapPctBadgeProps> = ({ snapPct }) => {
  const pct = Math.round(snapPct * 100);
  const color =
    pct >= 80
      ? 'text-cyan-300 bg-cyan-950/40 border-cyan-800'
      : pct >= 60
      ? 'text-slate-200 bg-slate-800 border-slate-700'
      : 'text-slate-400 bg-slate-900 border-slate-800';

  return (
    <span className={`inline-flex items-center font-mono text-xs px-1.5 py-0.5 rounded border ${color}`}>
      {pct}% Snap
    </span>
  );
};

interface GemRateBadgeProps {
  gemRate: number;
  psa10: number;
  total: number;
}

export const GemRateBadge: React.FC<GemRateBadgeProps> = ({ gemRate, psa10, total }) => {
  const pct = gemRate * 100;
  let barColor = 'bg-cyan-500';
  let textColor = 'text-cyan-300';

  if (pct >= 60) {
    barColor = 'bg-emerald-400';
    textColor = 'text-emerald-300';
  } else if (pct < 45) {
    barColor = 'bg-amber-400';
    textColor = 'text-amber-300';
  }

  return (
    <div className="flex flex-col gap-1 min-w-[90px]">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-mono font-semibold ${textColor}`}>
          {formatPercent(pct, 1)}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          {psa10}/{total}
        </span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
};

interface RoiBadgeProps {
  roiPct: number;
  expectedProfit?: number;
}

export const RoiBadge: React.FC<RoiBadgeProps> = ({ roiPct }) => {
  const isPositive = roiPct > 0;
  const isHighAlpha = roiPct >= 25;

  if (isHighAlpha) {
    return (
      <span className="inline-flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse-subtle">
        <Flame className="w-3.5 h-3.5 text-emerald-400" />
        {formatPercent(roiPct, 1, true)}
      </span>
    );
  }

  if (isPositive) {
    return (
      <span className="inline-flex items-center font-mono font-semibold text-xs px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
        {formatPercent(roiPct, 1, true)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center font-mono text-xs px-2 py-0.5 rounded-md bg-rose-950/40 text-rose-400 border border-rose-500/30">
      {formatPercent(roiPct, 1, true)}
    </span>
  );
};

interface SampleSizeBadgeProps {
  totalPop: number;
}

export const SampleSizeBadge: React.FC<SampleSizeBadgeProps> = ({ totalPop }) => {
  if (totalPop < 50) {
    return (
      <span
        title="Warning: PSA Population < 50 cards. Gem rate may have high statistical variance."
        className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40"
      >
        <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
        Pop &lt; 50
      </span>
    );
  }

  return (
    <span
      title="High confidence: Verified population >= 50 cards."
      className="inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-400 px-1 py-0.5"
    >
      <ShieldCheck className="w-2.5 h-2.5 text-slate-500" />
      Pop {totalPop}
    </span>
  );
};

interface MarginOfSafetyBadgeProps {
  marginOfSafetyPct: number;
  breakevenGemRate: number;
}

export const MarginOfSafetyBadge: React.FC<MarginOfSafetyBadgeProps> = ({
  marginOfSafetyPct,
  breakevenGemRate,
}) => {
  const isSafe = marginOfSafetyPct >= 15;
  const isThin = marginOfSafetyPct > 0 && marginOfSafetyPct < 15;

  let color = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
  if (isSafe) {
    color = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
  } else if (isThin) {
    color = 'bg-amber-950/60 text-amber-300 border-amber-500/30';
  }

  return (
    <div className="flex flex-col text-right font-mono text-xs">
      <span
        title={`Breakeven Gem Rate: ${(breakevenGemRate * 100).toFixed(1)}%`}
        className={`inline-flex items-center justify-end gap-1 px-1.5 py-0.5 rounded border text-[11px] font-semibold ${color}`}
      >
        {isSafe ? <ShieldCheck className="w-3 h-3 text-emerald-400" /> : <Shield className="w-3 h-3 opacity-60" />}
        <span>{formatPercent(marginOfSafetyPct, 1, true)} MoS</span>
      </span>
      <span className="text-[10px] text-slate-500 mt-0.5">
        BE: {(breakevenGemRate * 100).toFixed(1)}%
      </span>
    </div>
  );
};

interface ConfidenceTierBadgeProps {
  tier: ConfidenceTier;
}

export const ConfidenceTierBadge: React.FC<ConfidenceTierBadgeProps> = ({ tier }) => {
  if (tier === 'INSTITUTIONAL') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
        <Award className="w-3 h-3 text-emerald-400" />
        INSTITUTIONAL
      </span>
    );
  }
  if (tier === 'MODERATE') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
        MODERATE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30">
      SPECULATIVE
    </span>
  );
};
