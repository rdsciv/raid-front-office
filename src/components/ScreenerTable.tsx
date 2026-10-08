import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Download,
  PackagePlus,
  Check,
  Flame,
  LayoutGrid,
  List,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import {
  CardArbitrageRow,
  Position,
  ScreenerFilters,
  MarketParameters,
  PlayerArbitrageRecord,
  CardRecord,
} from '../lib/types';
import {
  formatCurrency,
  formatPercent,
  formatWopr,
} from '../lib/calculations';
import {
  PositionBadge,
  WoprDeltaBadge,
  SnapPctBadge,
  GemRateBadge,
  RoiBadge,
  SampleSizeBadge,
  MarginOfSafetyBadge,
  ConfidenceTierBadge,
} from './MetricBadge';

interface ScreenerTableProps {
  data: CardArbitrageRow[];
  parameters: MarketParameters;
  batchCardIds: Set<string>;
  onSelectRow: (row: CardArbitrageRow) => void;
  onOpenParameterDrawer: () => void;
  onAddToBatch: (player: PlayerArbitrageRecord, card: CardRecord) => void;
}

export const ScreenerTable: React.FC<ScreenerTableProps> = ({
  data,
  parameters,
  batchCardIds,
  onSelectRow,
  onOpenParameterDrawer,
  onAddToBatch,
}) => {
  // Filters state
  const [filters, setFilters] = useState<ScreenerFilters>({
    position: 'ALL',
    search: '',
    minRoi: -50,
    minGemRate: 0,
    minSnapPct: 0,
    positiveEvOnly: false,
    minPop50Only: false,
    minMarginOfSafety: -100,
    strategyPreset: 'ALL',
  });

  // Dense vs Standard view mode
  const [viewMode, setViewMode] = useState<'standard' | 'dense'>('standard');

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'roiPct', desc: true }, // Default: Highest ROI first
  ]);

  // Positions tab list
  const positions: Position[] = ['ALL', 'QB', 'WR', 'RB', 'TE'];

  // Apply Strategy Preset
  const applyStrategy = (strategy: string) => {
    if (strategy === 'ALPHA') {
      setFilters((prev) => ({
        ...prev,
        minRoi: 25,
        positiveEvOnly: true,
        strategyPreset: 'ALPHA',
      }));
    } else if (strategy === 'SAFETY') {
      setFilters((prev) => ({
        ...prev,
        minMarginOfSafety: 15,
        positiveEvOnly: true,
        strategyPreset: 'SAFETY',
      }));
    } else if (strategy === 'WOPR') {
      setFilters((prev) => ({
        ...prev,
        minSnapPct: 60,
        positiveEvOnly: true,
        strategyPreset: 'WOPR',
      }));
    } else if (strategy === 'LIQUID') {
      setFilters((prev) => ({
        ...prev,
        minPop50Only: true,
        strategyPreset: 'LIQUID',
      }));
    } else {
      setFilters({
        position: 'ALL',
        search: '',
        minRoi: -50,
        minGemRate: 0,
        minSnapPct: 0,
        positiveEvOnly: false,
        minPop50Only: false,
        minMarginOfSafety: -100,
        strategyPreset: 'ALL',
      });
    }
  };

  // Filtered rows
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Position filter
      if (filters.position !== 'ALL' && row.player.position !== filters.position) {
        return false;
      }

      // 2. Search query (Player, team, set, variation)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesPlayer = row.player.name.toLowerCase().includes(query);
        const matchesTeam = row.player.team.toLowerCase().includes(query);
        const matchesSet = row.card.set.toLowerCase().includes(query);
        const matchesVariation = row.card.variation.toLowerCase().includes(query);
        if (!matchesPlayer && !matchesTeam && !matchesSet && !matchesVariation) {
          return false;
        }
      }

      // 3. Min ROI
      if (row.roiPct < filters.minRoi) {
        return false;
      }

      // 4. Min Gem Rate %
      const gemRatePct = row.p10 * 100;
      if (gemRatePct < filters.minGemRate) {
        return false;
      }

      // 5. Min Snap %
      const snapPct = row.player.usage.snap_pct * 100;
      if (snapPct < filters.minSnapPct) {
        return false;
      }

      // 6. Positive EV only
      if (filters.positiveEvOnly && row.expectedNetProfit <= 0) {
        return false;
      }

      // 7. Pop >= 50 only
      if (filters.minPop50Only && row.card.psa_total < 50) {
        return false;
      }

      // 8. Margin of Safety
      if (row.marginOfSafetyPct < filters.minMarginOfSafety) {
        return false;
      }

      // Strategy WOPR filter
      if (filters.strategyPreset === 'WOPR' && row.player.usage.rolling_3wk_wopr_delta <= 0.04) {
        return false;
      }

      // Strategy Liquid filter
      if (filters.strategyPreset === 'LIQUID' && (row.card.psa_total < 150 || row.card.comps.sales_volume_7d < 12)) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  // Export filtered rows to CSV
  const handleExportCSV = () => {
    const headers = [
      'Player',
      'Team',
      'Position',
      'Set',
      'Variation',
      'Year',
      'Raw Comp',
      'PSA 9 Comp',
      'PSA 10 Comp',
      'PSA 10 Gem Rate',
      'Total PSA Pop',
      'Expected Profit (EV)',
      'ROI %',
      'Breakeven Gem Rate',
      'Margin of Safety %',
      'WOPR',
      '3w WOPR Delta',
      'Snap %',
      '7d Sales Vol',
    ];

    const rows = filteredData.map((r) => [
      `"${r.player.name}"`,
      r.player.team,
      r.player.position,
      `"${r.card.set}"`,
      `"${r.card.variation}"`,
      r.card.year,
      r.card.comps.raw_median,
      r.card.comps.psa_9_median,
      r.card.comps.psa_10_median,
      (r.p10 * 100).toFixed(1) + '%',
      r.card.psa_total,
      r.expectedNetProfit.toFixed(2),
      r.roiPct.toFixed(1) + '%',
      (r.breakevenGemRate * 100).toFixed(1) + '%',
      r.marginOfSafetyPct.toFixed(1) + '%',
      r.player.usage.wopr.toFixed(3),
      r.player.usage.rolling_3wk_wopr_delta.toFixed(3),
      (r.player.usage.snap_pct * 100).toFixed(0) + '%',
      r.card.comps.sales_volume_7d,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nfl_arbitrage_screener_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // TanStack Table Column Definitions
  const columns = useMemo<ColumnDef<CardArbitrageRow>[]>(
    () => [
      {
        id: 'player',
        header: 'Player',
        accessorFn: (row) => row.player.name,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3 min-w-[190px]">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                {item.player.headshot_url ? (
                  <img
                    src={item.player.headshot_url}
                    alt={item.player.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  item.player.name.substring(0, 2)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white hover:text-cyan-400 transition-colors">
                    {item.player.name}
                  </span>
                  <PositionBadge position={item.player.position} />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                  <span>{item.player.team}</span>
                  <span>•</span>
                  <span>Rookie '{item.player.rookie_year.toString().slice(-2)}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'opportunitySignal',
        header: 'NFL Usage Signal',
        accessorFn: (row) => row.player.usage.rolling_3wk_wopr_delta,
        cell: ({ row }) => {
          const item = row.original;
          const { usage, position } = item.player;
          return (
            <div className="flex flex-col gap-1 min-w-[140px]">
              <div className="flex items-center gap-1.5">
                <WoprDeltaBadge delta={usage.rolling_3wk_wopr_delta} />
                <SnapPctBadge snapPct={usage.snap_pct} />
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                {position !== 'QB' ? (
                  <span>
                    WOPR: <strong className="text-slate-200">{formatWopr(usage.wopr)}</strong> (Tgt {Math.round(usage.target_share * 100)}%)
                  </span>
                ) : (
                  <span>
                    EPA: <strong className={usage.weekly_history[usage.weekly_history.length - 1]?.epa >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {usage.weekly_history[usage.weekly_history.length - 1]?.epa.toFixed(2) || '0.00'}
                    </strong>
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: 'card',
        header: 'Card Specification',
        accessorFn: (row) => `${row.card.set} ${row.card.variation}`,
        cell: ({ row }) => {
          const { card, confidenceTier } = row.original;
          return (
            <div className="flex flex-col gap-0.5 min-w-[170px]">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-slate-200">
                  {card.set}
                </span>
                <ConfidenceTierBadge tier={confidenceTier} />
              </div>
              <div className="text-xs text-cyan-400 font-mono flex items-center gap-2">
                <span>{card.variation}</span>
                <span className="text-slate-400">#{card.card_number}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {card.year} · 7d Vol: <strong>{card.comps.sales_volume_7d}</strong> sales
              </div>
            </div>
          );
        },
      },
      {
        id: 'compsSpread',
        header: 'Raw vs. PSA 10',
        accessorFn: (row) => row.card.comps.psa_10_median,
        cell: ({ row }) => {
          const { card, spreadMultiplier } = row.original;
          return (
            <div className="flex flex-col gap-0.5 min-w-[130px]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Raw:</span>
                <span className="font-semibold text-slate-300">
                  {formatCurrency(card.comps.raw_median)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">PSA 9:</span>
                <span className="text-slate-400">
                  {formatCurrency(card.comps.psa_9_median)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono pt-0.5 border-t border-slate-800">
                <span className="text-emerald-400 font-bold">PSA 10:</span>
                <span className="font-bold text-emerald-300">
                  {formatCurrency(card.comps.psa_10_median)}
                </span>
              </div>
              <div className="text-[10px] text-right font-mono text-cyan-400">
                {spreadMultiplier.toFixed(1)}x Spread
              </div>
            </div>
          );
        },
      },
      {
        id: 'gemRate',
        header: 'Gem Rate %',
        accessorFn: (row) => row.p10,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col gap-1 min-w-[120px]">
              <GemRateBadge
                gemRate={item.p10}
                psa10={item.card.psa_10}
                total={item.card.psa_total}
              />
              <div className="flex items-center justify-between">
                <SampleSizeBadge totalPop={item.card.psa_total} />
                <span className="text-[10px] text-slate-400 font-mono">
                  Liq: {item.liquidityScore}/100
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: 'marginOfSafety',
        header: 'Margin of Safety',
        accessorFn: (row) => row.marginOfSafetyPct,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="min-w-[110px]">
              <MarginOfSafetyBadge
                marginOfSafetyPct={item.marginOfSafetyPct}
                breakevenGemRate={item.breakevenGemRate}
              />
            </div>
          );
        },
      },
      {
        id: 'expectedNetProfit',
        header: 'Expected Value ($EV)',
        accessorFn: (row) => row.expectedNetProfit,
        cell: ({ row }) => {
          const item = row.original;
          const isPos = item.expectedNetProfit > 0;
          return (
            <div className="flex flex-col text-right font-mono min-w-[110px]">
              <span
                className={`text-sm font-bold ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPos ? '+' : ''}
                {formatCurrency(item.expectedNetProfit)}
              </span>
              <span className="text-[10px] text-slate-400">
                Outlay: {formatCurrency(item.totalCost, 0)}
              </span>
            </div>
          );
        },
      },
      {
        id: 'roiPct',
        header: 'Grading ROI %',
        accessorFn: (row) => row.roiPct,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col items-end gap-1 min-w-[100px]">
              <RoiBadge
                roiPct={item.roiPct}
                expectedProfit={item.expectedNetProfit}
              />
              <span className="text-[10px] text-slate-500 font-mono">
                {item.roiPct > 0 ? '+EV Alpha' : '-EV Drag'}
              </span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original;
          const isInBatch = batchCardIds.has(item.id);

          return (
            <div className="flex items-center gap-1.5 justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToBatch(item.player, item.card);
                }}
                className={`p-1.5 rounded-lg transition-all text-xs flex items-center gap-1 ${
                  isInBatch
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                    : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300'
                }`}
                title={isInBatch ? 'In Batch (Click to add another)' : 'Add to Submission Batch'}
              >
                {isInBatch ? <Check className="w-3.5 h-3.5" /> : <PackagePlus className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRow(item);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                title="Open Deep-Dive Analytics"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    [parameters, onSelectRow, onAddToBatch, batchCardIds]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Front Office Strategy Presets Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Quant Strategies:
          </span>
          <button
            onClick={() => applyStrategy('ALL')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
              filters.strategyPreset === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Universe
          </button>
          <button
            onClick={() => applyStrategy('ALPHA')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1 ${
              filters.strategyPreset === 'ALPHA'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3 h-3 text-emerald-400" />
            Top Alpha (+25% ROI)
          </button>
          <button
            onClick={() => applyStrategy('SAFETY')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1 ${
              filters.strategyPreset === 'SAFETY'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Shield className="w-3 h-3 text-cyan-400" />
            Margin of Safety (&gt;15%)
          </button>
          <button
            onClick={() => applyStrategy('WOPR')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1 ${
              filters.strategyPreset === 'WOPR'
                ? 'bg-purple-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-purple-400" />
            WOPR Momentum Surges
          </button>
          <button
            onClick={() => applyStrategy('LIQUID')}
            className={`px-2.5 py-1 rounded-lg transition-all font-medium flex items-center gap-1 ${
              filters.strategyPreset === 'LIQUID'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3 h-3 text-amber-400" />
            Liquid Blue Chips (Pop &ge; 150)
          </button>
        </div>

        {/* View density and Export buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setViewMode(viewMode === 'standard' ? 'dense' : 'standard')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title={viewMode === 'standard' ? 'Switch to Dense Terminal View' : 'Switch to Standard View'}
          >
            {viewMode === 'standard' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg space-y-4">
        {/* Row 1: Search, Position Tabs & Fee Drawer Trigger */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Position Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start">
            {positions.map((pos) => {
              const isActive = filters.position === pos;
              return (
                <button
                  key={pos}
                  onClick={() => setFilters({ ...filters, position: pos })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {pos === 'ALL' ? 'All Positions' : pos}
                </button>
              );
            })}
          </div>

          {/* Search bar & Parameter Drawer button */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search player, team, set..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <button
              onClick={onOpenParameterDrawer}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 hover:border-cyan-500/50 text-xs font-semibold transition-all whitespace-nowrap shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Model Fees ({formatCurrency(parameters.gradingFee)})</span>
            </button>
          </div>
        </div>

        {/* Row 2: Sliders and Quick Toggles */}
        <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center text-xs">
          {/* Min ROI Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Min ROI:</span>
              <span className="text-cyan-400 font-semibold">{filters.minRoi}%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="100"
              step="5"
              value={filters.minRoi}
              onChange={(e) => setFilters({ ...filters, minRoi: parseInt(e.target.value) || 0 })}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Min Gem Rate Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Min Gem Rate:</span>
              <span className="text-cyan-400 font-semibold">{filters.minGemRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={filters.minGemRate}
              onChange={(e) => setFilters({ ...filters, minGemRate: parseInt(e.target.value) || 0 })}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Min Snap % Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Min Snap Share:</span>
              <span className="text-cyan-400 font-semibold">{filters.minSnapPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={filters.minSnapPct}
              onChange={(e) => setFilters({ ...filters, minSnapPct: parseInt(e.target.value) || 0 })}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Boolean Quick Toggles */}
          <div className="flex items-center gap-3 justify-end">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={filters.positiveEvOnly}
                onChange={(e) => setFilters({ ...filters, positiveEvOnly: e.target.checked })}
                className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 accent-emerald-500"
              />
              <span className="text-xs font-medium text-emerald-400">+EV Only</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={filters.minPop50Only}
                onChange={(e) => setFilters({ ...filters, minPop50Only: e.target.checked })}
                className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 accent-cyan-500"
              />
              <span className="text-xs font-medium text-slate-300">Pop &ge; 50</span>
            </label>
          </div>
        </div>
      </div>

      {/* TanStack Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-slate-950/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold"
                >
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const isSorted = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className={`font-display ${viewMode === 'dense' ? 'py-2 px-3' : 'py-3 px-4'}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div
                          className={`flex items-center gap-1.5 ${
                            canSort ? 'cursor-pointer select-none hover:text-white' : ''
                          }`}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-slate-500">
                              {isSorted === 'asc' ? (
                                <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                              ) : isSorted === 'desc' ? (
                                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                              ) : (
                                <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectRow(row.original)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`${viewMode === 'dense' ? 'py-2 px-3 text-xs' : 'py-3.5 px-4 text-xs'}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-slate-500 text-sm"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-600" />
                      <p>No rookie card arbitrage opportunities match your current filter criteria.</p>
                      <button
                        onClick={() => applyStrategy('ALL')}
                        className="text-xs text-cyan-400 hover:underline mt-1"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="font-mono">
            Showing{' '}
            <strong className="text-white">
              {table.getRowModel().rows.length > 0
                ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
                : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-white">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                filteredData.length
              )}
            </strong>{' '}
            of <strong className="text-cyan-400">{filteredData.length}</strong> opportunities
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {Math.max(1, table.getPageCount())}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
