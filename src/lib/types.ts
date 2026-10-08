export type Position = 'ALL' | 'QB' | 'WR' | 'RB' | 'TE';

export interface WeeklyUsage {
  week: number;
  targets: number;
  target_share?: number;
  wopr: number;
  epa: number;
  raw_price?: number;
  psa10_price?: number;
}

export interface PlayerUsage {
  snap_pct: number;
  route_participation_pct: number;
  target_share: number;
  air_yards_share: number;
  wopr: number;
  yprr: number;
  rolling_3wk_wopr_delta: number;
  weekly_history: WeeklyUsage[];
}

export interface CardComps {
  raw_median: number;
  psa_9_median: number;
  psa_10_median: number;
  sales_volume_7d: number;
  last_sale_date: string;
}

export interface CardRecord {
  card_id: string;
  year: number;
  set: string;
  variation: string;
  card_number: string;
  psa_total: number;
  psa_10: number;
  psa_9: number;
  gem_rate: number;
  comps: CardComps;
}

export interface PlayerArbitrageRecord {
  player_id: string;
  name: string;
  position: 'QB' | 'WR' | 'RB' | 'TE';
  team: string;
  rookie_year: number;
  headshot_url?: string;
  usage: PlayerUsage;
  cards: CardRecord[];
}

export interface MarketParameters {
  gradingFee: number; // default: 19.00
  shippingFee: number; // default: 3.50
  sellerFeePct: number; // default: 13.25 (%)
  gemRateHaircutPct: number; // default: 0 (%) e.g. 10% stricter standard haircut
}

export type ConfidenceTier = 'INSTITUTIONAL' | 'MODERATE' | 'SPECULATIVE';

export interface CalculatedCardArbitrage {
  p10: number; // adjusted gem rate
  p9: number; // psa 9 rate
  pOther: number; // sub-9 or cracked raw rate (1 - p10 - p9)
  rawCost: number;
  totalCost: number; // C_raw + C_grade + C_ship
  expectedRevenue: number; // gross discounted revenue
  expectedNetProfit: number; // EV
  roiPct: number; // (EV / totalCost) * 100
  isLowSampleSize: boolean; // psa_total < 50
  spreadMultiplier: number; // psa_10 / raw_median
  breakevenGemRate: number; // Minimum P10 needed for EV >= 0
  marginOfSafetyPct: number; // (effectiveP10 - breakevenGemRate) * 100
  upsideNet: number; // Net profit if PSA 10 occurs
  downsideNet: number; // Net profit/loss if PSA 9 occurs
  riskRewardRatio: number; // upsideNet / Math.abs(downsideNet)
  liquidityScore: number; // 0 - 100 liquidity indicator
  confidenceTier: ConfidenceTier;
}

export interface CardArbitrageRow extends CalculatedCardArbitrage {
  id: string;
  player: PlayerArbitrageRecord;
  card: CardRecord;
}

export interface ScreenerFilters {
  position: Position;
  search: string;
  minRoi: number;
  minGemRate: number;
  minSnapPct: number;
  positiveEvOnly: boolean;
  minPop50Only: boolean;
  minMarginOfSafety: number; // Minimum Margin of Safety %
  strategyPreset?: string;
}

export interface GradingBatchItem {
  id: string;
  player: PlayerArbitrageRecord;
  card: CardRecord;
  quantity: number;
  calculated: CalculatedCardArbitrage;
}

export interface GradingBatchSummary {
  totalCards: number;
  totalRawCost: number;
  totalGradingFees: number;
  totalShippingFees: number;
  totalCapitalOutlay: number;
  expectedGrossRevenue: number;
  expectedNetProfit: number;
  blendedRoiPct: number;
  blendedGemRate: number;
  worstCaseDownside: number;
  bestCaseUpside: number;
}

export interface SensitivityMatrixCell {
  priceShockPct: number;
  gemShockPct: number;
  ev: number;
  roiPct: number;
}
