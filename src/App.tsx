import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  TrendingUp,
  Sliders,
  DollarSign,
  Layers,
  Sparkles,
  RefreshCw,
  Award,
  Zap,
  ShieldCheck,
  Flame,
  Info,
  Package,
  FileCode,
  Download,
  Shield,
  HelpCircle,
  Compass,
  Activity,
  Binary,
  Target,
} from 'lucide-react';
import {
  PlayerArbitrageRecord,
  CardArbitrageRow,
  MarketParameters,
  GradingBatchItem,
  CardRecord,
} from './lib/types';
import {
  DEFAULT_PARAMETERS,
  calculateCardArbitrage,
  calculateGradingBatchSummary,
  formatCurrency,
  formatPercent,
  formatWopr,
} from './lib/calculations';
import { FALLBACK_ARBITRAGE_DATA } from './data/fallbackData';
import { ScreenerTable } from './components/ScreenerTable';
import { ParameterDrawer } from './components/ParameterDrawer';
import { PlayerChartModal } from './components/PlayerChartModal';
import { BatchDrawer } from './components/BatchDrawer';
import { RoiBadge } from './components/MetricBadge';
import { CombineProspect } from './lib/combineTypes';
import { CombineScoutView } from './components/CombineScout/CombineScoutView';
import { KinematicMatrixView } from './components/CombineScout/KinematicMatrixView';
import { ProspectModal } from './components/CombineScout/ProspectModal';
import { SchemeFitView } from './components/SchemeFit/SchemeFitView';
import { EmpiricalLabView } from './components/Presentation/EmpiricalLabView';
import { PresentationDeckView } from './components/Presentation/PresentationDeckView';
import { ResearchPaperView } from './components/Presentation/ResearchPaperView';

export function App() {
  const [activeTab, setActiveTab] = useState<
    'scheme_fit' | 'combine_scout' | 'decision_matrix' | 'empirical_lab' | 'presentation_deck' | 'research_paper' | 'grading_arbitrage'
  >('scheme_fit');
  const [combineProspects, setCombineProspects] = useState<CombineProspect[]>([]);
  const [selectedCombineProspect, setSelectedCombineProspect] = useState<CombineProspect | null>(null);
  const [isLoadingCombine, setIsLoadingCombine] = useState<boolean>(true);

  const [players, setPlayers] = useState<PlayerArbitrageRecord[]>(FALLBACK_ARBITRAGE_DATA);
  const [parameters, setParameters] = useState<MarketParameters>(DEFAULT_PARAMETERS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerArbitrageRecord | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(undefined);
  const [dataSource, setDataSource] = useState<'static_json' | 'fallback'>('fallback');
  const [lastSyncDate, setLastSyncDate] = useState<string>('2026-10-07');
  const [batchItems, setBatchItems] = useState<GradingBatchItem[]>([]);

  // Load flat static JSON from public/data/arbitrage_data.json
  useEffect(() => {
    let isMounted = true;
    async function loadArbitrageData() {
      try {
        const response = await fetch('./data/arbitrage_data.json', { cache: 'no-cache' });
        if (response.ok) {
          const json = await response.json();
          if (Array.isArray(json) && json.length > 0 && isMounted) {
            setPlayers(json);
            setDataSource('static_json');
            setLastSyncDate(new Date().toISOString().split('T')[0]);
          }
        }
      } catch (err) {
        console.warn('Utilizing verified baseline fixtures:', err);
      }
    }

    loadArbitrageData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load 510-prospect Combine Scout dataset from public/data/combine_scout_data.json
  useEffect(() => {
    let isMounted = true;
    async function loadCombineData() {
      try {
        const response = await fetch('./data/combine_scout_data.json', { cache: 'no-cache' });
        if (response.ok) {
          const json = await response.json();
          if (Array.isArray(json) && json.length > 0 && isMounted) {
            setCombineProspects(json);
          }
        }
      } catch (err) {
        console.warn('Utilizing fallback combine data:', err);
      } finally {
        if (isMounted) setIsLoadingCombine(false);
      }
    }

    loadCombineData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute flattened card rows with live EV & ROI calculations
  const flattenedRows: CardArbitrageRow[] = useMemo(() => {
    const rows: CardArbitrageRow[] = [];
    players.forEach((player) => {
      player.cards.forEach((card) => {
        const calculated = calculateCardArbitrage(card, parameters);
        rows.push({
          id: `${player.player_id}-${card.card_id}`,
          player,
          card,
          ...calculated,
        });
      });
    });
    return rows;
  }, [players, parameters]);

  // Batch management handlers
  const handleAddToBatch = useCallback(
    (player: PlayerArbitrageRecord, card: CardRecord) => {
      const id = `${player.player_id}-${card.card_id}`;
      setBatchItems((prev) => {
        const existingIdx = prev.findIndex((item) => item.id === id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + 1,
          };
          return updated;
        } else {
          const calc = calculateCardArbitrage(card, parameters);
          return [
            ...prev,
            {
              id,
              player,
              card,
              quantity: 1,
              calculated: calc,
            },
          ];
        }
      });
    },
    [parameters]
  );

  const handleUpdateBatchQuantity = useCallback((id: string, delta: number) => {
    setBatchItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as GradingBatchItem[]
    );
  }, []);

  const handleRemoveFromBatch = useCallback((id: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleClearBatch = useCallback(() => {
    setBatchItems([]);
  }, []);

  // Set of card IDs in current batch
  const batchCardIds = useMemo(() => {
    return new Set(batchItems.map((b) => b.id));
  }, [batchItems]);

  const batchSummary = useMemo(() => {
    return calculateGradingBatchSummary(batchItems, parameters);
  }, [batchItems, parameters]);

  // Aggregate KPI summary stats
  const kpiStats = useMemo(() => {
    if (flattenedRows.length === 0) {
      return {
        topRoiRow: null,
        avgGemRate: 0,
        topWoprPlayer: null,
        totalSalesVolume7d: 0,
        avgMarginOfSafety: 0,
      };
    }

    // Top ROI Card
    const sortedByRoi = [...flattenedRows].sort((a, b) => b.roiPct - a.roiPct);
    const topRoiRow = sortedByRoi[0];

    // Class Average Gem Rate & Margin of Safety
    let totalPsa10 = 0;
    let totalPop = 0;
    let totalVol = 0;
    let sumMoS = 0;

    flattenedRows.forEach((r) => {
      totalPsa10 += r.card.psa_10;
      totalPop += r.card.psa_total;
      totalVol += r.card.comps.sales_volume_7d;
      sumMoS += r.marginOfSafetyPct;
    });

    const avgGemRate = totalPop > 0 ? (totalPsa10 / totalPop) * 100 : 0;
    const avgMarginOfSafety = sumMoS / flattenedRows.length;

    // Highest WOPR Player
    const sortedByWopr = [...players].sort((a, b) => b.usage.wopr - a.usage.wopr);
    const topWoprPlayer = sortedByWopr[0];

    return {
      topRoiRow,
      avgGemRate,
      topWoprPlayer,
      totalSalesVolume7d: totalVol,
      avgMarginOfSafety,
    };
  }, [flattenedRows, players]);

  // Keyboard shortcut listener (ESC to close, B to toggle batch)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPlayer(null);
        setSelectedCombineProspect(null);
        setIsDrawerOpen(false);
        setIsBatchOpen(false);
      }
      if ((e.key === 'b' || e.key === 'B') && !['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        setIsBatchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Row selection handler
  const handleSelectRow = (row: CardArbitrageRow) => {
    setSelectedPlayer(row.player);
    setSelectedCardId(row.card.card_id);
  };

  // Export full JSON dataset
  const handleExportFullJSON = () => {
    const blob = new Blob([JSON.stringify(players, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nfl_arbitrage_dataset_${lastSyncDate}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border shadow-lg transition-all ${
              activeTab === 'scheme_fit'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : activeTab === 'combine_scout'
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                : activeTab === 'decision_matrix'
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                : activeTab === 'empirical_lab'
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                : activeTab === 'presentation_deck'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                : activeTab === 'research_paper'
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.25)]'
                : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
            }`}>
              {activeTab === 'scheme_fit' ? <Target className="w-5 h-5" /> :
               activeTab === 'combine_scout' ? <Compass className="w-5 h-5" /> :
               activeTab === 'decision_matrix' ? <Activity className="w-5 h-5" /> :
               activeTab === 'empirical_lab' ? <Layers className="w-5 h-5" /> :
               activeTab === 'presentation_deck' ? <Award className="w-5 h-5" /> :
               activeTab === 'research_paper' ? <FileCode className="w-5 h-5" /> :
               <Zap className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                  <span>
                    {activeTab === 'scheme_fit' && 'NFL Team Scheme Fit Engine'}
                    {activeTab === 'combine_scout' && 'NFL Scouting Combine Explorer'}
                    {activeTab === 'decision_matrix' && '10 Hz Kinematic Translation Matrix'}
                    {activeTab === 'empirical_lab' && 'Empirical Telemetry Lab & Figures'}
                    {activeTab === 'presentation_deck' && 'Combine Finals Presentation Deck'}
                    {activeTab === 'research_paper' && 'Big Data Bowl 2027 Research Paper'}
                    {activeTab === 'grading_arbitrage' && 'NFL Front Office Grading Arbitrage'}
                  </span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                    activeTab === 'scheme_fit'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                      : activeTab === 'combine_scout'
                      ? 'bg-blue-950 text-blue-400 border-blue-500/40'
                      : activeTab === 'decision_matrix'
                      ? 'bg-indigo-950 text-indigo-400 border-indigo-500/40'
                      : activeTab === 'empirical_lab'
                      ? 'bg-purple-950 text-purple-400 border-purple-500/40'
                      : activeTab === 'presentation_deck'
                      ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                      : activeTab === 'research_paper'
                      ? 'bg-sky-950 text-sky-400 border-sky-500/40'
                      : 'bg-cyan-950 text-cyan-400 border-cyan-500/40'
                  }`}>
                    {activeTab === 'scheme_fit' && '32 Franchise Profiles'}
                    {activeTab === 'combine_scout' && '517 Prospects • 10 Hz RFID'}
                    {activeTab === 'decision_matrix' && 'Sleepers vs Bust Traps'}
                    {activeTab === 'empirical_lab' && 'Figures 1–4 Case Studies'}
                    {activeTab === 'presentation_deck' && 'Indianapolis 10-Min Live'}
                    {activeTab === 'research_paper' && '1,952 Words • LRT p < 0.0001'}
                    {activeTab === 'grading_arbitrage' && 'Institutional Screener'}
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                {activeTab === 'scheme_fit' && 'Sifting 517 prospects across 32 franchise tactical schemes (Shanahan Zone, Fangio Quarters, Spags Blitz, Schwartz Wide-9, Power Trench)'}
                {activeTab === 'combine_scout' && 'Comprehensive evaluation of 517 Combine prospects (2023–2025) with physical drill percentiles, continuous kinematics, and comps'}
                {activeTab === 'decision_matrix' && 'Cross-referencing stopwatch speeds with continuous sensor mechanics (DEI, EBI, FI, TEI) to isolate sleepers and bust traps'}
                {activeTab === 'empirical_lab' && 'Publication-grade 300 DPI figures submitted to NFL Big Data Bowl 2027 with ground-truth 10 Hz trajectory case studies'}
                {activeTab === 'presentation_deck' && 'Executive 10-slide presentation deck formatted for the NFL Scouting Combine live finalist presentation in Indianapolis'}
                {activeTab === 'research_paper' && 'Official 1,952-word competition submission writeup with statistical model tables, GNN architectures, and Jupyter notebook'}
                {activeTab === 'grading_arbitrage' && 'Cross-referencing weekly NFL usage indicators (WOPR, Air Yards, EPA) with PSA population comps to isolate +EV spreads'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setActiveTab('scheme_fit')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'scheme_fit'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Scheme Fit</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.2 rounded-full border border-emerald-400/30 text-emerald-300">
                32
              </span>
            </button>

            <button
              onClick={() => setActiveTab('combine_scout')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'combine_scout'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Combine Scout</span>
              <span className="text-[10px] bg-blue-950 px-1.5 py-0.2 rounded-full border border-blue-400/30 text-blue-300">
                {combineProspects.length || 517}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('decision_matrix')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'decision_matrix'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Decision Matrix</span>
              <span className="text-[10px] bg-indigo-950 px-1.5 py-0.2 rounded-full border border-indigo-400/30 text-indigo-300">
                10 Hz
              </span>
            </button>

            <button
              onClick={() => setActiveTab('empirical_lab')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'empirical_lab'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Empirical Figures</span>
              <span className="text-[10px] bg-purple-950 px-1.5 py-0.2 rounded-full border border-purple-400/30 text-purple-300">
                Figs 1–4
              </span>
            </button>

            <button
              onClick={() => setActiveTab('presentation_deck')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'presentation_deck'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Finalist Deck</span>
              <span className="text-[10px] bg-amber-950 px-1.5 py-0.2 rounded-full border border-amber-400/30 text-amber-300">
                10 Slides
              </span>
            </button>

            <button
              onClick={() => setActiveTab('research_paper')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'research_paper'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Research Paper</span>
              <span className="text-[10px] bg-sky-950 px-1.5 py-0.2 rounded-full border border-sky-400/30 text-sky-300">
                Writeup
              </span>
            </button>

            <button
              onClick={() => setActiveTab('grading_arbitrage')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'grading_arbitrage'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Card Arbitrage</span>
            </button>
          </div>

          {/* Arbitrage-Specific Controls */}
          {activeTab === 'grading_arbitrage' && (
            <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap">
              {/* Batch Pill Trigger */}
              <button
                onClick={() => setIsBatchOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  batchItems.length > 0
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Open Submission Batch Builder (Hot-key: B)"
              >
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Batch: {batchSummary.totalCards} Cards</span>
                {batchSummary.totalCards > 0 && (
                  <span className="font-mono text-emerald-400 font-bold">
                    (+{formatCurrency(batchSummary.expectedNetProfit, 0)})
                  </span>
                )}
              </button>

              {/* Parameter Drawer button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Model Fees ({formatCurrency(parameters.gradingFee)})</span>
                {parameters.gemRateHaircutPct > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>

              {/* Static Sync Pill */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{dataSource === 'static_json' ? 'Live Synced' : 'Active'}</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-500">{lastSyncDate}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'combine_scout' && (
          isLoadingCombine ? (
            <div className="p-16 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
              <Compass className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-400" />
              <div className="font-bold text-white text-base">Loading 510 NFL Scouting Combine Prospects...</div>
              <div className="text-xs text-slate-500 mt-1">Ingesting 10 Hz kinematic telemetry and athletic score percentiles</div>
            </div>
          ) : (
            <CombineScoutView prospects={combineProspects} />
          )
        )}

        {activeTab === 'scheme_fit' && (
          <SchemeFitView
            prospects={combineProspects}
            onSelectProspect={(p) => setSelectedCombineProspect(p)}
          />
        )}

        {activeTab === 'decision_matrix' && (
          <KinematicMatrixView
            prospects={combineProspects}
            onSelectProspect={(p) => setSelectedCombineProspect(p)}
          />
        )}

        {activeTab === 'empirical_lab' && (
          <EmpiricalLabView />
        )}

        {activeTab === 'presentation_deck' && (
          <PresentationDeckView />
        )}

        {activeTab === 'research_paper' && (
          <ResearchPaperView />
        )}

        {activeTab === 'grading_arbitrage' && (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Top Arbitrage Spread */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                Top +EV Opportunity
              </span>
              {kpiStats.topRoiRow && (
                <RoiBadge
                  roiPct={kpiStats.topRoiRow.roiPct}
                  expectedProfit={kpiStats.topRoiRow.expectedNetProfit}
                />
              )}
            </div>
            {kpiStats.topRoiRow ? (
              <div
                className="mt-2.5 cursor-pointer"
                onClick={() => handleSelectRow(kpiStats.topRoiRow!)}
              >
                <div className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {kpiStats.topRoiRow.player.name}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                  {kpiStats.topRoiRow.card.set} {kpiStats.topRoiRow.card.variation}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400">Net Expected Profit:</span>
                  <span className="text-emerald-400 font-bold">
                    +{formatCurrency(kpiStats.topRoiRow.expectedNetProfit)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs mt-3">Calculating...</div>
            )}
          </div>

          {/* Card 2: Highest WOPR Opportunity Engine */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Alpha Usage Engine (WOPR)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                1st in Class
              </span>
            </div>
            {kpiStats.topWoprPlayer ? (
              <div
                className="mt-2.5 cursor-pointer"
                onClick={() => {
                  setSelectedPlayer(kpiStats.topWoprPlayer);
                  setSelectedCardId(kpiStats.topWoprPlayer?.cards[0]?.card_id);
                }}
              >
                <div className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {kpiStats.topWoprPlayer.name}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {kpiStats.topWoprPlayer.team} · WR ({formatPercent(kpiStats.topWoprPlayer.usage.target_share * 100, 1)} Target Share)
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400">Season WOPR:</span>
                  <span className="text-cyan-400 font-bold">
                    {formatWopr(kpiStats.topWoprPlayer.usage.wopr)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs mt-3">Loading...</div>
            )}
          </div>

          {/* Card 3: Class Average Margin of Safety */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Avg Margin of Safety
              </span>
              <span className="font-mono text-xs text-slate-300">
                Gem Buffer
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold font-mono text-white">
                {formatPercent(kpiStats.avgMarginOfSafety, 1, true)}
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Avg Class Gem: {formatPercent(kpiStats.avgGemRate, 1)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/60">
                <span className="text-slate-400">Haircut Stress:</span>
                <span className={parameters.gemRateHaircutPct > 0 ? 'text-amber-400' : 'text-slate-400'}>
                  {parameters.gemRateHaircutPct > 0 ? `-${parameters.gemRateHaircutPct}% Active` : '0% (Standard)'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Tracked Universe */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Tracked Universe
              </span>
              <button
                onClick={handleExportFullJSON}
                className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                title="Download raw flat JSON dataset"
              >
                <Download className="w-3 h-3" />
                JSON
              </button>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold font-mono text-white">
                {flattenedRows.length} <span className="text-sm font-normal text-slate-400">Cards</span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {players.length} Key Offensive Rookies
              </div>
              <div className="mt-2 flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/60">
                <span className="text-slate-400">7-Day Sales Volume:</span>
                <span className="text-cyan-400 font-bold">
                  {kpiStats.totalSalesVolume7d} Sold Comps
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Screener Table */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-display text-white tracking-wide">
                Rookie Grading Arbitrage Screener
              </h2>
              <p className="text-xs text-slate-400">
                Rank and filter rookie cards where raw cost + grading fees beat PSA 10 comps. Click any row for deep-dive correlation charts.
              </p>
            </div>
          </div>

          <ScreenerTable
            data={flattenedRows}
            parameters={parameters}
            batchCardIds={batchCardIds}
            onSelectRow={handleSelectRow}
            onOpenParameterDrawer={() => setIsDrawerOpen(true)}
            onAddToBatch={handleAddToBatch}
          />
        </section>

        {/* Methodology & EV Calculation Explainer Card */}
        <section className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white uppercase tracking-wider text-xs">
              Grading Arbitrage Methodology & Theoretical Foundation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="font-semibold text-cyan-400 font-mono">1. Expected Value (EV) & Breakeven Gem Rate</div>
              <p className="text-slate-400 leading-relaxed">
                Expected Value evaluates the probability-weighted return of submitting a raw rookie card to PSA, factoring in gem rates and transaction fees:
              </p>
              <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-200 border border-slate-800">
                EV = [ (P₁₀ × V₁₀ × (1 - F_sell)) + (P₉ × V₉ × (1 - F_sell)) + ((1 - P₁₀ - P₉) × V_raw × (1 - F_sell)) ] - (C_raw + C_grade + C_ship)
              </div>
              <div className="text-[11px] text-slate-400">
                The <strong className="text-cyan-300">Breakeven Gem Rate (P₁₀*)</strong> identifies the minimum gem probability required for zero expected loss:
                <br />
                <code className="text-emerald-300">Margin of Safety = (Historical Gem Rate - P₁₀*) × 100</code>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="font-semibold text-emerald-400 font-mono">2. Weighted Opportunity Rating (WOPR)</div>
              <p className="text-slate-400 leading-relaxed">
                WOPR isolates leading on-field indicators that precede hobby price breakouts before mainstream sports card market comps adjust:
              </p>
              <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-200 border border-slate-800">
                WOPR = 1.5 × Target Share + 0.7 × Air Yards Share
              </div>
              <div className="text-[11px] text-slate-400">
                Players with positive 3-week rolling WOPR deltas and high snap rates frequently exhibit delayed price surges in PSA 10 card comps.
              </div>
            </div>
          </div>
            </section>
          </>
        )}
      </main>

      {/* Parameter Drawer */}
      <ParameterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        parameters={parameters}
        onUpdateParameters={setParameters}
      />

      {/* Batch Drawer */}
      <BatchDrawer
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        batchItems={batchItems}
        parameters={parameters}
        onUpdateQuantity={handleUpdateBatchQuantity}
        onRemoveItem={handleRemoveFromBatch}
        onClearBatch={handleClearBatch}
      />

      {/* Player Deep Dive Modal */}
      <PlayerChartModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        parameters={parameters}
        selectedCardId={selectedCardId}
        onAddToBatch={handleAddToBatch}
      />

      {/* Combine Prospect Detail Modal */}
      <ProspectModal
        prospect={selectedCombineProspect}
        onClose={() => setSelectedCombineProspect(null)}
        onSelectComp={(compName) => {
          const match = combineProspects.find((p) => p.name.toLowerCase() === compName.toLowerCase());
          if (match) setSelectedCombineProspect(match);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono">
            <span>Serverless Static Architecture</span>
            <span>•</span>
            <span>Vite + React</span>
            <span>•</span>
            <span>GitHub Pages</span>
          </div>
          <div className="text-center sm:text-right">
            NFL analytics & sports card comps. Scheduled weekly via GitHub Actions cron.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
