import React, { useState } from 'react';
import { Layers, Activity, TrendingUp, Compass, ExternalLink, Download, Sparkles, CheckCircle2 } from 'lucide-react';

interface FigureData {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageSrc: string;
  caption: string;
  keyInsights: string[];
  metrics: { label: string; value: string; delta: string }[];
}

const FIGURES: FigureData[] = [
  {
    id: 'figure4',
    title: 'Figure 4: Continuous 10 Hz Trajectory Case Studies',
    subtitle: 'Deceleration Arcs & 3-Cone Apex Bend Dynamics',
    badge: 'Empirical Case Study',
    imageSrc: './figures/figure4_kinematic_trajectory_case_study.png',
    caption: 'Ground-truth 10 Hz telemetry coordinates comparing WR deceleration braking arcs (Jayden Reed vs. Isaac TeSlaa) and EDGE apex cornering bend (Isaiah Foskey vs. Lukas Van Ness).',
    keyInsights: [
      'Jayden Reed (DEI = 15.0) decelerates from 19.8 mph to a full stop in a 2.1-yard tight braking arc, creating immediate stem separation.',
      'Isaac TeSlaa (DEI = 1.0) drifts 4.8 yards along a wide rounding arc, allowing NFL defensive backs to maintain catch-point phase.',
      'Isaiah Foskey (EBI = 158.2) dips his shoulder under the apex cone with a 1.9-yard turning radius, flattening directly to the pocket.',
      'Lukas Van Ness (EBI = 106.0) washes 3.7 yards past the apex cone, demonstrating stiff hip transition mechanics despite high straight-line speed.'
    ],
    metrics: [
      { label: 'Reed Braking Arc', value: '2.1 yd', delta: '-56% distance' },
      { label: 'TeSlaa Drift Arc', value: '4.8 yd', delta: '+128% drift' },
      { label: 'Foskey Turning Rad', value: '1.9 yd', delta: 'Tight Apex Bend' },
      { label: 'Van Ness Turning Rad', value: '3.7 yd', delta: 'Washed Out Arc' }
    ]
  },
  {
    id: 'figure1',
    title: 'Figure 1: Statistical Predictive Model Comparison',
    subtitle: 'Nested OLS vs. Spatio-Temporal Graph Neural Network',
    badge: 'Model Performance',
    imageSrc: './figures/figure1_model_performance_comparison.png',
    caption: 'Model performance progression ($R^2$ and RMSE) across positional cohorts comparing Baseline Physical Testing, Nested Kinematic OLS, and the Spatio-Temporal GNN.',
    keyInsights: [
      'Traditional stopwatch drills account for less than 12% of in-game performance variance across wide receivers and defensive backs.',
      'Incorporating continuous 10 Hz kinematic extractors improves explained variance by +10.8% for WRs, +58.2% for EDGE rushers, and +68.3% for trench linemen.',
      'Spatio-Temporal GNN captures multi-body spatial interactions, outperforming standard OLS across every evaluated positional group.',
      'All kinematic metric additions pass the Likelihood Ratio Test at p < 0.001 significance.'
    ],
    metrics: [
      { label: 'Trench Model ΔR²', value: '+0.683', delta: 'p < 0.0001' },
      { label: 'EDGE Model ΔR²', value: '+0.582', delta: 'p < 0.0001' },
      { label: 'CB Model ΔR²', value: '+0.546', delta: 'p < 0.0001' },
      { label: 'WR Model ΔR²', value: '+0.108', delta: 'p < 0.001' }
    ]
  },
  {
    id: 'figure2',
    title: 'Figure 2: Evaluator Decision Matrix (4-Quadrant Archetypes)',
    subtitle: 'Stopwatch Speed vs. 10 Hz Kinematic Efficiency',
    badge: 'Draft Capital Inefficiency',
    imageSrc: './figures/figure2_evaluator_decision_matrix.png',
    caption: 'The Evaluator Decision Matrix mapping 40-yard dash speed against positional Kinematic Indices, isolating Hidden Sleepers from Bust Traps.',
    keyInsights: [
      'Quadrant II (Upper Right): ⭐ ELITE PRODUCERS possess both elite straight-line velocity and high deceleration/bend efficiency.',
      'Quadrant I (Upper Left): 💎 HIDDEN SLEEPERS feature modest 40-yard dash times but elite functional movement efficiency (e.g., Jayden Reed, Tucker Kraft).',
      'Quadrant IV (Lower Right): 🚨 BUST TRAPS possess blazing 40-yard track times but stiff, linear deceleration profiles that fail against NFL press coverage.',
      'Draft rooms relying solely on stopwatch times systematically overpay for Quadrant IV athletes while forfeiting Quadrant I surplus value.'
    ],
    metrics: [
      { label: 'Sleeper Hit Rate', value: '78.4%', delta: '+34% vs consensus' },
      { label: 'Bust Trap Penalty', value: '-0.38 EPA', delta: 'High Draft Capital Waste' },
      { label: 'Cohort Prospects', value: '517', delta: '2023–2025 Drafts' },
      { label: 'Quadrants Defined', value: '4 Distinct', delta: 'Actionable Tiers' }
    ]
  },
  {
    id: 'figure3',
    title: 'Figure 3: Empirical NFL Translation Relationships',
    subtitle: 'Combine Kinematics vs. In-Game Next Gen Stats (NGS)',
    badge: 'Translation Validation',
    imageSrc: './figures/figure3_nfl_translation_relationships.png',
    caption: 'Direct linear translation regression curves relating Combine sensor metrics (DEI, EBI, FI, TEI) to regular-season Next Gen Stats performance.',
    keyInsights: [
      'Deceleration Efficiency Index (DEI) strongly predicts regular season route stem separation (r = 0.58, p < 0.001).',
      'Edge Bend Index (EBI) exhibits a steep positive gradient against regular-season pressure rate on true pass sets.',
      'Fluidity Index (FI) correlates negatively with Defensive EPA allowed (higher fluidity = lower opponent EPA).',
      'Trench Explosiveness Index (TEI) predicts early-down line-of-scrimmage displacement and penetration depth.'
    ],
    metrics: [
      { label: 'DEI vs Stem Sep', value: 'r = 0.58', delta: 'High Correlation' },
      { label: 'EBI vs Pressure %', value: 'r = 0.64', delta: 'Steep Positive Slope' },
      { label: 'FI vs Def EPA', value: 'r = -0.52', delta: 'Suppresses Big Plays' },
      { label: 'TEI vs LOS Push', value: 'r = 0.69', delta: 'Trench Dominance' }
    ]
  }
];

export const EmpiricalLabView: React.FC = () => {
  const [selectedFigureId, setSelectedFigureId] = useState<string>('figure4');
  const activeFigure = FIGURES.find((f) => f.id === selectedFigureId) || FIGURES[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                BDB 2027 EMPIRICAL EVIDENCE
              </span>
              <span className="text-xs text-slate-400">Publication Visuals & Telemetry Studies</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              Empirical Telemetry Lab & Publication Figures
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              High-resolution 300 DPI publication figures submitted to the NFL Big Data Bowl 2027. Each chart isolates empirical proof that continuous 10 Hz Combine sensor tracking solves the evaluation failures of stopwatch testing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="./visualizer.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Activity className="w-4 h-4" />
              <span>Launch 10 Hz Telemetry Replay</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
          {FIGURES.map((fig) => {
            const isSelected = fig.id === selectedFigureId;
            return (
              <button
                key={fig.id}
                onClick={() => setSelectedFigureId(fig.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60 shadow-lg shadow-indigo-500/10 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className={isSelected ? 'text-indigo-400 font-bold' : 'text-slate-500'}>
                    {fig.badge}
                  </span>
                  {isSelected && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                </div>
                <div className="text-xs font-bold truncate">{fig.title.split(':')[0]}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{fig.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Figure Display Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <span className="text-xs font-mono uppercase text-indigo-400 font-bold">
              {activeFigure.badge}
            </span>
            <h3 className="text-lg sm:text-xl font-bold font-display text-white mt-0.5">
              {activeFigure.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{activeFigure.caption}</p>
          </div>
          <a
            href={activeFigure.imageSrc}
            download
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/40 self-start md:self-auto transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download 300 DPI PNG</span>
          </a>
        </div>

        {/* High-Res Image Container */}
        <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-2 sm:p-4 overflow-hidden shadow-2xl flex items-center justify-center">
          <img
            src={activeFigure.imageSrc}
            alt={activeFigure.title}
            className="w-full max-h-[650px] object-contain rounded-lg"
          />
        </div>

        {/* Empirical Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {activeFigure.metrics.map((m, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5"
            >
              <div className="text-[11px] font-mono text-slate-400">{m.label}</div>
              <div className="text-lg font-bold font-mono text-white mt-1">{m.value}</div>
              <div className="text-[11px] font-mono text-cyan-400 mt-0.5">{m.delta}</div>
            </div>
          ))}
        </div>

        {/* Key Analytical Insights */}
        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300 uppercase">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>Key Empirical Takeaways for NFL Front Offices</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
            {activeFigure.keyInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                <span className="text-indigo-400 font-mono font-bold">0{idx + 1}.</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
