import React from 'react';
import { CombineProspect } from '../../lib/combineTypes';
import { X, Award, Activity, Compass, Zap, UserCheck, Shield, ChevronRight } from 'lucide-react';

interface ProspectModalProps {
  prospect: CombineProspect | null;
  onClose: () => void;
  onSelectComp?: (compName: string) => void;
}

export const ProspectModal: React.FC<ProspectModalProps> = ({ prospect, onClose, onSelectComp }) => {
  if (!prospect) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
    if (score >= 60) return 'text-blue-400 border-blue-500/40 bg-blue-950/40';
    if (score >= 40) return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    return 'text-rose-400 border-rose-500/40 bg-rose-950/40';
  };

  const getPercentileBarColor = (pct: number | null) => {
    if (pct === null) return 'bg-gray-700';
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-blue-500';
    if (pct >= 30) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const isSleeper = prospect.kinematics.classification.includes('SLEEPER');
  const isBust = prospect.kinematics.classification.includes('BUST');
  const isElite = prospect.kinematics.classification.includes('ELITE');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-800 bg-gray-950/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-bold rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
                {prospect.position}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {prospect.college} • {prospect.conference}
              </span>
              {prospect.draft_pick && (
                <span className="text-xs font-mono text-gray-300 bg-gray-800 px-2 py-0.5 rounded">
                  Round {prospect.draft_round || Math.ceil(prospect.draft_pick / 32)} • Pick #{prospect.draft_pick}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              {prospect.name}
              {prospect.career.pro_bowl > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Award className="w-3.5 h-3.5" /> Pro Bowl
                </span>
              )}
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                isSleeper ? 'bg-blue-900/40 text-blue-300 border-blue-500/50 shadow-sm shadow-blue-500/20' :
                isBust ? 'bg-rose-900/40 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20' :
                isElite ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/50' :
                'bg-gray-800 text-gray-300 border-gray-700'
              }`}>
                {prospect.kinematics.classification}
              </span>
              <span className="text-xs text-gray-400">
                Draft Class {prospect.draft_year}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Athletic Score</div>
              <div className={`text-2xl font-black px-3 py-1 rounded-xl border mt-1 ${getScoreColor(prospect.athletic_score)}`}>
                {prospect.athletic_score}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Row: Measurements & Physical Profile */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-gray-950/60 rounded-xl border border-gray-800/80">
            <div>
              <div className="text-[11px] text-gray-400 font-medium">Height</div>
              <div className="text-base font-bold text-white mt-0.5">{prospect.measurements.height_formatted}</div>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">Weight</div>
              <div className="text-base font-bold text-white mt-0.5">
                {prospect.measurements.weight_lbs ? `${prospect.measurements.weight_lbs} lbs` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">Arm Length</div>
              <div className="text-base font-bold text-white mt-0.5">
                {prospect.measurements.arm_length ? `${prospect.measurements.arm_length}"` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">Hand Size</div>
              <div className="text-base font-bold text-white mt-0.5">
                {prospect.measurements.hand_size ? `${prospect.measurements.hand_size}"` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">Wingspan</div>
              <div className="text-base font-bold text-white mt-0.5">
                {prospect.measurements.wing_span ? `${prospect.measurements.wing_span}"` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 font-medium">Career Starts</div>
              <div className="text-base font-bold text-white mt-0.5">{prospect.career.games_started} / {prospect.career.games_active}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Traditional Combine Testing & Percentiles */}
            <div className="bg-gray-950/40 p-5 rounded-xl border border-gray-800">
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Combine Physical Testing & Percentiles
              </h3>

              <div className="space-y-3.5">
                {[
                  { label: '40-Yard Dash', val: prospect.drills.forty, unit: 's', pct: prospect.drills.pct_forty },
                  { label: '10-Yard Split', val: prospect.drills.ten_yd_split, unit: 's', pct: prospect.drills.pct_ten_split },
                  { label: '20-Yd Short Shuttle', val: prospect.drills.short_shuttle, unit: 's', pct: prospect.drills.pct_shuttle },
                  { label: '3-Cone Drill', val: prospect.drills.three_cone, unit: 's', pct: prospect.drills.pct_three_cone },
                  { label: 'Vertical Jump', val: prospect.drills.vertical, unit: '"', pct: prospect.drills.pct_vertical },
                  { label: 'Broad Jump', val: prospect.drills.broad_jump, unit: '"', pct: prospect.drills.pct_broad },
                  { label: 'Bench Press Reps', val: prospect.drills.bench_reps, unit: ' reps', pct: prospect.drills.pct_bench },
                ].map((drill, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">{drill.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">
                          {drill.val !== null ? `${drill.val}${drill.unit}` : 'DNP'}
                        </span>
                        {drill.pct !== null && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-800 text-gray-300">
                            {drill.pct.toFixed(0)}th %ile
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getPercentileBarColor(drill.pct)}`}
                        style={{ width: `${drill.pct ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 10 Hz Kinematic Analysis & Comps */}
            <div className="space-y-6">
              {/* 10 Hz UKTE Module */}
              <div className="bg-gradient-to-br from-blue-950/30 to-purple-950/20 p-5 rounded-xl border border-blue-900/40">
                <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  10 Hz Sensor Kinematics (UKTE Engine)
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800">
                    <div className="text-[11px] text-gray-400">{prospect.kinematics.kin_metric_name} Score</div>
                    <div className="text-xl font-black text-blue-400 mt-1">
                      {prospect.kinematics.kin_score !== null ? prospect.kinematics.kin_score : 'Calibrated'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800">
                    <div className="text-[11px] text-gray-400">NFL In-Game Target</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">
                      {prospect.kinematics.target_value !== null ? prospect.kinematics.target_value : 'Projected'}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-300 leading-relaxed bg-gray-900/40 p-3 rounded-lg border border-gray-800/60">
                  {isSleeper && (
                    <span className="text-blue-300">
                      <strong>💎 Front-Office Alpha:</strong> Movement micro-kinematics exceed aggregate stopwatch baseline. Exhibits elite joint mechanics and rapid force application.
                    </span>
                  )}
                  {isBust && (
                    <span className="text-rose-300">
                      <strong>🚨 Bust Risk Trap:</strong> Impressive track stopwatch, but high turning slip angles or multi-step deceleration latency. Vulnerable to NFL speed transitions.
                    </span>
                  )}
                  {isElite && (
                    <span className="text-emerald-300">
                      <strong>⭐ Consensus Anchor:</strong> Elite linear sprint times validated by top-percentile continuous vector mechanics.
                    </span>
                  )}
                  {!isSleeper && !isBust && !isElite && (
                    <span className="text-gray-300">
                      <strong>📋 Positional Depth:</strong> Standard functional athleticism; projects as a dependable rotational contributor.
                    </span>
                  )}
                </div>
              </div>

              {/* Box Score Scout Style: Similar Athlete Comps */}
              <div className="bg-gray-950/40 p-5 rounded-xl border border-gray-800">
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-purple-400" />
                    Similar Athlete Comps (BoxScoreScout Engine)
                  </span>
                  <span className="text-[11px] text-gray-400 font-normal">Nearest Neighbors</span>
                </h3>

                <div className="space-y-2.5">
                  {prospect.similar_comps.map((comp, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-gray-900/70 hover:bg-gray-800/70 border border-gray-800/80 rounded-lg flex items-center justify-between transition-colors cursor-pointer group"
                      onClick={() => onSelectComp && onSelectComp(comp.name)}
                    >
                      <div>
                        <div className="font-bold text-white text-xs group-hover:text-blue-400 flex items-center gap-1.5 transition-colors">
                          {comp.name}
                          <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400" />
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {comp.college} • Pick #{comp.pick} ({comp.draft_year})
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-purple-300">
                          {comp.similarity_pct}% Match
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Athletic: {comp.athletic_score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-950/70 flex justify-between items-center text-xs text-gray-400">
          <span>Source: NFL Big Data Bowl 2027 & nflverse Combine Archives</span>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close Scout Card
          </button>
        </div>
      </div>
    </div>
  );
};
