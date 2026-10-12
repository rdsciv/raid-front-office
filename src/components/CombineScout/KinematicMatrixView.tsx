import React, { useState, useMemo } from 'react';
import { CombineProspect } from '../../lib/combineTypes';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Cell 
} from 'recharts';
import { Sparkles, AlertTriangle, Shield, Flame, Activity } from 'lucide-react';

interface KinematicMatrixViewProps {
  prospects: CombineProspect[];
  onSelectProspect: (prospect: CombineProspect) => void;
}

export const KinematicMatrixView: React.FC<KinematicMatrixViewProps> = ({ prospects, onSelectProspect }) => {
  const [selectedArchetype, setSelectedArchetype] = useState<'wr' | 'edge' | 'cb' | 'trench'>('wr');

  const archetypeConfig = {
    wr: {
      title: 'Wide Receivers & Tight Ends',
      metric: 'DEI',
      metricLabel: 'Decel Efficiency Index (DEI)',
      drillLabel: '20-yd Short Shuttle',
      positions: ['WR', 'TE', 'SLOT_WR'],
      drillKey: 'short_shuttle',
      invertedDrill: true,
      inGameLabel: 'Route Stem Separation (yd)'
    },
    edge: {
      title: 'EDGE Rushers & Defensive Linemen',
      metric: 'EBI',
      metricLabel: 'Effective Bend Index (EBI)',
      drillLabel: '3-Cone Drill',
      positions: ['DE', 'OLB', 'EDGE', 'DT'],
      drillKey: 'three_cone',
      invertedDrill: true,
      inGameLabel: 'Pass Rush Disruption Rate (%)'
    },
    cb: {
      title: 'Defensive Backs (CB & Safety)',
      metric: 'FI',
      metricLabel: 'Hip Fluidity Index (FI)',
      drillLabel: '40-Yard Dash',
      positions: ['CB', 'SS', 'FS', 'DB', 'S'],
      drillKey: 'forty',
      invertedDrill: true,
      inGameLabel: 'Target Defensive EPA'
    },
    trench: {
      title: 'Interior Trench & Running Backs',
      metric: 'TEI',
      metricLabel: 'Trench Explosiveness (TEI)',
      drillLabel: '10-Yard Split',
      positions: ['G', 'T', 'C', 'IOL', 'DT', 'NT', 'RB'],
      drillKey: 'ten_yd_split',
      invertedDrill: true,
      inGameLabel: 'Line Leverage Displacement (yd)'
    }
  };

  const currentCfg = archetypeConfig[selectedArchetype];

  // Prepare scatter data with standardized z-scores
  const scatterData = useMemo(() => {
    const subset = prospects.filter(p => {
      const posMatch = currentCfg.positions.includes(p.position) || currentCfg.positions.includes(p.combine_position);
      const hasKin = p.kinematics.kin_score !== null;
      const drillVal = (p.drills as any)[currentCfg.drillKey];
      return posMatch && hasKin && drillVal !== null;
    });

    if (subset.length === 0) return [];

    // Calculate means and stds for z-scores
    const tradVals = subset.map(p => (p.drills as any)[currentCfg.drillKey] as number);
    const kinVals = subset.map(p => p.kinematics.kin_score as number);

    const meanTrad = tradVals.reduce((a, b) => a + b, 0) / tradVals.length;
    const stdTrad = Math.sqrt(tradVals.reduce((acc, v) => acc + (v - meanTrad)**2, 0) / tradVals.length) || 1.0;

    const meanKin = kinVals.reduce((a, b) => a + b, 0) / kinVals.length;
    const stdKin = Math.sqrt(kinVals.reduce((acc, v) => acc + (v - meanKin)**2, 0) / kinVals.length) || 1.0;

    return subset.map(p => {
      const rawTrad = (p.drills as any)[currentCfg.drillKey] as number;
      const rawKin = p.kinematics.kin_score as number;

      // Invert traditional drill so fast speed is positive z-score
      const z_trad = currentCfg.invertedDrill 
        ? -((rawTrad - meanTrad) / stdTrad)
        : (rawTrad - meanTrad) / stdTrad;

      const z_kin = (rawKin - meanKin) / stdKin;

      return {
        nfl_id: p.nfl_id,
        name: p.name,
        college: p.college,
        pick: p.draft_pick,
        position: p.position,
        rawTrad: rawTrad.toFixed(2),
        rawKin: rawKin.toFixed(1),
        z_trad: Number(z_trad.toFixed(2)),
        z_kin: Number(z_kin.toFixed(2)),
        classification: p.kinematics.classification,
        prospectObj: p
      };
    });
  }, [prospects, selectedArchetype]);

  const getColor = (classification: string) => {
    if (classification.includes('SLEEPER')) return '#3b82f6';
    if (classification.includes('BUST')) return '#ef4444';
    if (classification.includes('ELITE')) return '#10b981';
    return '#94a3b8';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold text-white text-sm flex items-center justify-between gap-4">
            <span>{d.name}</span>
            <span className="font-mono text-gray-400">#{d.pick ?? 'UDFA'}</span>
          </div>
          <div className="text-gray-400">{d.college} • {d.position}</div>
          <div className="pt-1.5 border-t border-gray-800 space-y-0.5">
            <div>• {currentCfg.drillLabel}: <strong className="text-gray-200">{d.rawTrad}s</strong> (z: {d.z_trad})</div>
            <div>• {currentCfg.metricLabel}: <strong className="text-blue-400">{d.rawKin}</strong> (z: {d.z_kin})</div>
          </div>
          <div className="pt-1 text-[11px] font-bold" style={{ color: getColor(d.classification) }}>
            {d.classification}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Archetype Selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(archetypeConfig) as Array<keyof typeof archetypeConfig>).map(key => (
          <button
            key={key}
            onClick={() => setSelectedArchetype(key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedArchetype === key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {archetypeConfig[key].title}
          </button>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              {currentCfg.title}: 10 Hz Evaluator Decision Matrix
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Comparing Traditional Stopwatch Benchmark ({currentCfg.drillLabel}) vs. 10 Hz Kinematic Feature ({currentCfg.metricLabel})
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> 💎 Hidden Sleeper
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> 🚨 Bust Trap
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> ⭐ Elite
            </span>
          </div>
        </div>

        {/* Recharts Scatter Plot */}
        <div className="w-full h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
              <XAxis 
                type="number" 
                dataKey="z_trad" 
                name="Stopwatch Speed z-score" 
                domain={[-2.5, 2.5]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Traditional Stopwatch Speed (Fast ◄──► Slow)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis 
                type="number" 
                dataKey="z_kin" 
                name="10 Hz Kinematics z-score" 
                domain={[-2.5, 2.5]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: '10 Hz Kinematics z-score (Elite ▲)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
              />
              <ZAxis range={[60, 60]} />
              <ReferenceLine x={0} stroke="#475569" strokeDasharray="4 4" />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="4 4" />
              <Tooltip content={<CustomTooltip />} />
              <Scatter 
                data={scatterData} 
                onClick={(node) => onSelectProspect(node.payload.prospectObj)}
                cursor="pointer"
              >
                {scatterData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getColor(entry.classification)}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Four Quadrants Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-800 text-xs">
          <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800">
            <div className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Q2: Hidden Sleepers
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Modest stopwatch times, but top-tier joint kinematics. Elite value target for Day 2/3 draft capital.
            </p>
          </div>
          <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800">
            <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Q1: Elite Consensus
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Blistering straight-line speed backed by elite deceleration/bend mechanics. Franchise anchors.
            </p>
          </div>
          <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800">
            <div className="font-bold text-rose-400 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Q4: Bust Risk Traps
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Elite straight-line track sprinters with stiff deceleration or high slip angle. First-round traps.
            </p>
          </div>
          <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800">
            <div className="font-bold text-gray-400 mb-1">
              📋 Q3: Depth / Rotational
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Below-average stopwatch and functional movement profiles. Backup and priority free agents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
