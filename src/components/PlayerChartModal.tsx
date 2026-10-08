import React, { useState, useMemo } from 'react';
import {
  X,
  TrendingUp,
  Activity,
  Award,
  Layers,
  AlertTriangle,
  Info,
  Calendar,
  DollarSign,
  BarChart2,
  PackagePlus,
  ShieldCheck,
  Grid,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PlayerArbitrageRecord, MarketParameters, CardRecord } from '../lib/types';
import {
  calculateCardArbitrage,
  generateSensitivityMatrix,
  formatCurrency,
  formatPercent,
  formatWopr,
} from '../lib/calculations';
import {
  PositionBadge,
  WoprDeltaBadge,
  GemRateBadge,
  RoiBadge,
  SampleSizeBadge,
  MarginOfSafetyBadge,
  ConfidenceTierBadge,
} from './MetricBadge';

interface PlayerChartModalProps {
  player: PlayerArbitrageRecord | null;
  onClose: () => void;
  parameters: MarketParameters;
  selectedCardId?: string;
  onAddToBatch?: (player: PlayerArbitrageRecord, card: CardRecord) => void;
}

export const PlayerChartModal: React.FC<PlayerChartModalProps> = ({
  player,
  onClose,
  parameters,
  selectedCardId,
  onAddToBatch,
}) => {
  if (!player) return null;

  const [activeCardId, setActiveCardId] = useState<string>(
    selectedCardId || (player.cards[0]?.card_id || '')
  );
  const [activeTab, setActiveTab] = useState<'chart' | 'sensitivity' | 'parallels'>('chart');
  const [primaryMetric, setPrimaryMetric] = useState<'wopr' | 'target_share' | 'epa'>('wopr');

  const activeCard: CardRecord | undefined =
    player.cards.find((c) => c.card_id === activeCardId) || player.cards[0];

  const activeArbitrage = useMemo(() => {
    return activeCard ? calculateCardArbitrage(activeCard, parameters) : null;
  }, [activeCard, parameters]);

  // Transform weekly history into dual-axis chart points
  const chartData = useMemo(() => {
    return player.usage.weekly_history.map((wk) => {
      return {
        name: `Wk ${wk.week}`,
        week: wk.week,
        wopr: wk.wopr,
        target_share: wk.target_share !== undefined ? Number((wk.target_share * 100).toFixed(1)) : 0,
        epa: wk.epa,
        raw_price: wk.raw_price || (activeCard ? activeCard.comps.raw_median : 0),
        psa10_price: wk.psa10_price || (activeCard ? activeCard.comps.psa_10_median : 0),
      };
    });
  }, [player, activeCard]);

  // Compute correlation r between WOPR and PSA 10 price
  const correlationR = useMemo(() => {
    if (chartData.length < 3) return null;
    const xs = chartData.map((d) => d.wopr);
    const ys = chartData.map((d) => d.psa10_price);
    const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;

    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let i = 0; i < xs.length; i++) {
      const dx = xs[i] - meanX;
      const dy = ys[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const den = Math.sqrt(denX * denY);
    return den > 0 ? num / den : 0;
  }, [chartData]);

  // 5x4 Sensitivity Matrix for active card
  const sensitivityMatrix = useMemo(() => {
    return activeCard ? generateSensitivityMatrix(activeCard, parameters) : [];
  }, [activeCard, parameters]);

  const isSmallSampleOverall = player.cards.some((c) => c.psa_total < 50);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-cyan-500/30 overflow-hidden flex items-center justify-center text-slate-400 font-bold text-lg shadow-md flex-shrink-0">
              {player.headshot_url ? (
                <img
                  src={player.headshot_url}
                  alt={player.name}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                player.name.substring(0, 2)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-wide">
                  {player.name}
                </h2>
                <PositionBadge position={player.position} />
                <span className="font-mono text-xs text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  {player.team} · Class of {player.rookie_year}
                </span>
                {activeArbitrage && (
                  <ConfidenceTierBadge tier={activeArbitrage.confidenceTier} />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                <span>Weighted Opportunity Rating (WOPR): <strong className="text-cyan-400 font-mono">{formatWopr(player.usage.wopr)}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  Trend: <WoprDeltaBadge delta={player.usage.rolling_3wk_wopr_delta} />
                </span>
                {correlationR !== null && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-400">
                      Usage-Price Correlation: <strong className={correlationR > 0.5 ? 'text-emerald-400' : 'text-slate-200'}>r = {correlationR.toFixed(2)}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Usage Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Snap Share</span>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatPercent(player.usage.snap_pct * 100, 1)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Route Part.</span>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatPercent(player.usage.route_participation_pct * 100, 1)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Target Share</span>
              <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                {formatPercent(player.usage.target_share * 100, 1)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Air Yards Share</span>
              <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                {formatPercent(player.usage.air_yards_share * 100, 1)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">Yards / Route (YPRR)</span>
              <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                {player.usage.yprr > 0 ? player.usage.yprr.toFixed(2) : '—'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium">3-Wk WOPR Δ</span>
              <div className="text-base font-bold font-mono mt-0.5">
                <WoprDeltaBadge delta={player.usage.rolling_3wk_wopr_delta} />
              </div>
            </div>
          </div>

          {/* Navigation Tabs inside modal */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'chart'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Usage vs Price Correlation</span>
            </button>
            <button
              onClick={() => setActiveTab('sensitivity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'sensitivity'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Stress-Test Matrix</span>
            </button>
            <button
              onClick={() => setActiveTab('parallels')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'parallels'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tracked Parallels ({player.cards.length})</span>
            </button>
          </div>

          {/* TAB 1: Dual-Axis Visual Chart */}
          {activeTab === 'chart' && (
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-cyan-400" />
                    Dual-Axis Correlation: On-Field Production vs. Card Sold Comps
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Left Axis: NFL Performance | Right Axis: Card Comp Pricing ($)
                  </p>
                </div>

                {/* Metric toggles and Card selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                    <button
                      onClick={() => setPrimaryMetric('wopr')}
                      className={`px-2 py-1 rounded ${
                        primaryMetric === 'wopr' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      WOPR
                    </button>
                    <button
                      onClick={() => setPrimaryMetric('target_share')}
                      className={`px-2 py-1 rounded ${
                        primaryMetric === 'target_share' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Target %
                    </button>
                    <button
                      onClick={() => setPrimaryMetric('epa')}
                      className={`px-2 py-1 rounded ${
                        primaryMetric === 'epa' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      EPA
                    </button>
                  </div>

                  <select
                    value={activeCardId}
                    onChange={(e) => setActiveCardId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {player.cards.map((c) => (
                      <option key={c.card_id} value={c.card_id}>
                        {c.set} {c.variation} (#{c.card_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#06b6d4"
                      fontSize={11}
                      domain={[0, 'auto']}
                      tickLine={false}
                      axisLine={{ stroke: '#0e7490' }}
                      tickFormatter={(val) => primaryMetric === 'target_share' ? `${val}%` : val.toFixed(2)}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#10b981"
                      fontSize={11}
                      domain={['auto', 'auto']}
                      tickLine={false}
                      axisLine={{ stroke: '#047857' }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      formatter={(value: any, name: any) => {
                        if (name === 'PSA 10 Comp' || name === 'Raw Comp') {
                          return [formatCurrency(Number(value)), String(name)];
                        }
                        if (name === 'Target Share %') {
                          return [`${value}%`, String(name)];
                        }
                        return [value, String(name)];
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                    {primaryMetric === 'wopr' && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="wopr"
                        name="WOPR Rating"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#06b6d4' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {primaryMetric === 'target_share' && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="target_share"
                        name="Target Share %"
                        stroke="#818cf8"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#818cf8' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {primaryMetric === 'epa' && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="epa"
                        name="EPA per Play"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#f59e0b' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="psa10_price"
                      name="PSA 10 Comp"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="raw_price"
                      name="Raw Comp"
                      stroke="#e2e8f0"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      dot={{ r: 3, fill: '#e2e8f0' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: Sensitivity Matrix */}
          {activeTab === 'sensitivity' && activeCard && (
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Grid className="w-4 h-4 text-cyan-400" />
                    Scenario Stress-Test: {activeCard.set} {activeCard.variation}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Matrix displays projected <strong>EV Profit</strong> across PSA 10 Price Shocks vs. Gem Rate Standard Shocks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeCardId}
                    onChange={(e) => setActiveCardId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    {player.cards.map((c) => (
                      <option key={c.card_id} value={c.card_id}>
                        {c.set} {c.variation}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                      <th className="p-2.5 text-left font-sans">Gem Rate \ PSA 10 Price</th>
                      <th className="p-2.5">-20% Price</th>
                      <th className="p-2.5">-10% Price</th>
                      <th className="p-2.5 text-cyan-400 font-bold">Base Price</th>
                      <th className="p-2.5">+10% Price</th>
                      <th className="p-2.5">+20% Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {sensitivityMatrix.map((row, rowIdx) => {
                      const gemShockLabel = row[0].gemShockPct === 0 ? 'Base Gem' : `${row[0].gemShockPct > 0 ? '+' : ''}${row[0].gemShockPct}% Gem`;
                      return (
                        <tr key={rowIdx} className="hover:bg-slate-900/50">
                          <td className="p-2.5 text-left font-sans text-slate-300 font-medium bg-slate-900/40">
                            {gemShockLabel}
                          </td>
                          {row.map((cell, colIdx) => {
                            const isPos = cell.ev > 0;
                            const isBaseCell = cell.priceShockPct === 0 && cell.gemShockPct === 0;
                            return (
                              <td
                                key={colIdx}
                                className={`p-2.5 ${
                                  isBaseCell ? 'ring-2 ring-cyan-500/50 rounded-lg' : ''
                                } ${isPos ? 'text-emerald-400 bg-emerald-950/20' : 'text-rose-400 bg-rose-950/20'}`}
                              >
                                <div className="font-bold">
                                  {isPos ? '+' : ''}
                                  {formatCurrency(cell.ev, 0)}
                                </div>
                                <div className="text-[10px] opacity-75">
                                  {formatPercent(cell.roiPct, 0, true)}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Tracked Rookie Parallels Breakdown */}
          {activeTab === 'parallels' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  All Tracked Parallels ({player.cards.length})
                </h3>
                {isSmallSampleOverall && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>PSA Pop &lt; 50 detected on some parallels</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {player.cards.map((card) => {
                  const arbitrage = calculateCardArbitrage(card, parameters);
                  const isSelected = card.card_id === activeCardId;

                  return (
                    <div
                      key={card.card_id}
                      onClick={() => setActiveCardId(card.card_id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500/60 ring-1 ring-cyan-500/30'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {card.set}
                          </div>
                          <div className="text-xs text-cyan-400 font-mono mt-0.5">
                            {card.variation} #{card.card_number}
                          </div>
                        </div>
                        <SampleSizeBadge totalPop={card.psa_total} />
                      </div>

                      {/* Comps Pricing Row */}
                      <div className="grid grid-cols-3 gap-2 my-3 p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase">Raw</span>
                          <div className="font-mono text-xs font-semibold text-slate-200">
                            {formatCurrency(card.comps.raw_median)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase">PSA 9</span>
                          <div className="font-mono text-xs font-semibold text-slate-300">
                            {formatCurrency(card.comps.psa_9_median)}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold text-emerald-400">PSA 10</span>
                          <div className="font-mono text-xs font-bold text-emerald-300">
                            {formatCurrency(card.comps.psa_10_median)}
                          </div>
                        </div>
                      </div>

                      {/* Gem Rate & Margin of Safety */}
                      <div className="mb-3 space-y-2">
                        <GemRateBadge
                          gemRate={card.gem_rate}
                          psa10={card.psa_10}
                          total={card.psa_total}
                        />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400">Margin of Safety:</span>
                          <MarginOfSafetyBadge
                            marginOfSafetyPct={arbitrage.marginOfSafetyPct}
                            breakevenGemRate={arbitrage.breakevenGemRate}
                          />
                        </div>
                      </div>

                      {/* EV Net Profit & ROI */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Expected Profit</span>
                          <span
                            className={`font-mono font-bold ${
                              arbitrage.expectedNetProfit > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {arbitrage.expectedNetProfit > 0 ? '+' : ''}
                            {formatCurrency(arbitrage.expectedNetProfit)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Projected ROI</span>
                          <RoiBadge
                            roiPct={arbitrage.roiPct}
                            expectedProfit={arbitrage.expectedNetProfit}
                          />
                        </div>
                      </div>

                      {onAddToBatch && (
                        <div className="mt-3 pt-2 border-t border-slate-800/80">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToBatch(player, card);
                            }}
                            className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            <span>Add to Grading Batch</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Dynamic model: Fee {formatCurrency(parameters.gradingFee)}, Ship {formatCurrency(parameters.shippingFee)}, Take {formatPercent(parameters.sellerFeePct, 2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeCard && onAddToBatch && (
              <button
                onClick={() => onAddToBatch(player, activeCard)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors"
              >
                <PackagePlus className="w-3.5 h-3.5" />
                <span>Add Selected to Batch</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
