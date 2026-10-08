import {
  CardRecord,
  CalculatedCardArbitrage,
  MarketParameters,
  GradingBatchItem,
  GradingBatchSummary,
  SensitivityMatrixCell,
  ConfidenceTier,
} from './types';

export const DEFAULT_PARAMETERS: MarketParameters = {
  gradingFee: 19.0, // Standard bulk grading fee per card (e.g., PSA Value Bulk)
  shippingFee: 3.5, // Round-trip shipping & insurance per card
  sellerFeePct: 13.25, // Standard eBay / marketplace final value + processing fee
  gemRateHaircutPct: 0.0, // Stricter grading penalty haircut (0-50%)
};

/**
 * Calculates Expected Value (EV), Net Profit, ROI, Breakeven Gem Rate,
 * Margin of Safety, Downside Risk, and Liquidity for sports card grading arbitrage.
 */
export function calculateCardArbitrage(
  card: CardRecord,
  params: MarketParameters = DEFAULT_PARAMETERS,
  rawCostOverride?: number
): CalculatedCardArbitrage {
  const psaTotal = Math.max(0, card.psa_total || 0);
  const rawP10 = psaTotal > 0 ? Math.min(1, Math.max(0, card.psa_10 / psaTotal)) : 0;
  const rawP9 = psaTotal > 0 ? Math.min(1, Math.max(0, card.psa_9 / psaTotal)) : 0;

  // Stricter grading haircut simulation
  const haircutMultiplier = Math.max(0, 1 - (params.gemRateHaircutPct / 100));
  const effectiveP10 = rawP10 * haircutMultiplier;
  const haircutShift = rawP10 - effectiveP10;

  // Shift 80% of haircut cards to PSA 9, remaining 20% to sub-9/raw
  const effectiveP9 = Math.min(1 - effectiveP10, rawP9 + haircutShift * 0.8);
  const effectivePOther = Math.max(0, 1 - effectiveP10 - effectiveP9);

  const v10 = Math.max(0, card.comps.psa_10_median || 0);
  const v9 = Math.max(0, card.comps.psa_9_median || 0);
  const vRaw = Math.max(0, card.comps.raw_median || 0);
  const cRaw = rawCostOverride !== undefined ? Math.max(0, rawCostOverride) : vRaw;

  const fSell = Math.min(1, Math.max(0, params.sellerFeePct / 100));
  const netMultiplier = Math.max(0, 1 - fSell);

  // Revenue expectations after seller fees
  const rev10 = effectiveP10 * v10 * netMultiplier;
  const rev9 = effectiveP9 * v9 * netMultiplier;
  const revOther = effectivePOther * vRaw * netMultiplier;
  const expectedRevenue = rev10 + rev9 + revOther;

  // Total input costs: Raw card cost + Grading fee + Round-trip shipping
  const totalCost = cRaw + Math.max(0, params.gradingFee) + Math.max(0, params.shippingFee);

  // Expected Value (Net Profit)
  const expectedNetProfit = expectedRevenue - totalCost;

  // Return on Investment (ROI %)
  const roiPct = totalCost > 0 ? (expectedNetProfit / totalCost) * 100 : 0;

  const spreadMultiplier = vRaw > 0 ? v10 / vRaw : 0;
  const isLowSampleSize = psaTotal < 50;

  // 1. Breakeven Gem Rate:
  // EV = [ P10* V10 + P9 V9 + (1 - P10* - P9) Vraw ] * netMultiplier - totalCost = 0
  // Solving for P10*:
  // P10* * (V10 - Vraw) * netMultiplier = totalCost - [ P9 V9 + (1 - P9) Vraw ] * netMultiplier
  let breakevenGemRate = 1.0;
  const spreadDelta = v10 - vRaw;
  if (spreadDelta > 0 && netMultiplier > 0) {
    const requiredGross = totalCost / netMultiplier;
    const baseRevenueWithout10 = (effectiveP9 * v9) + ((1 - effectiveP9) * vRaw);
    breakevenGemRate = (requiredGross - baseRevenueWithout10) / spreadDelta;
    breakevenGemRate = Math.max(0, Math.min(1.5, breakevenGemRate)); // Bounded [0, 1.5]
  }

  // 2. Margin of Safety: (Effective P10 - Breakeven P10) * 100
  const marginOfSafetyPct = (effectiveP10 - breakevenGemRate) * 100;

  // 3. Scenario Outcomes:
  const upsideNet = (v10 * netMultiplier) - totalCost;
  const downsideNet = (v9 * netMultiplier) - totalCost;

  // 4. Risk / Reward Ratio:
  const riskAmount = Math.max(1, Math.abs(downsideNet));
  const riskRewardRatio = upsideNet > 0 ? upsideNet / riskAmount : 0;

  // 5. Liquidity Score (0 - 100):
  const volScore = Math.min(50, (card.comps.sales_volume_7d || 0) * 2.5);
  const popScore = Math.min(50, (psaTotal / 500) * 50);
  const liquidityScore = Math.round(volScore + popScore);

  // 6. Confidence Tier:
  let confidenceTier: ConfidenceTier = 'MODERATE';
  if (psaTotal >= 150 && (card.comps.sales_volume_7d || 0) >= 15) {
    confidenceTier = 'INSTITUTIONAL';
  } else if (psaTotal < 50) {
    confidenceTier = 'SPECULATIVE';
  }

  return {
    p10: effectiveP10,
    p9: effectiveP9,
    pOther: effectivePOther,
    rawCost: cRaw,
    totalCost,
    expectedRevenue,
    expectedNetProfit,
    roiPct,
    isLowSampleSize,
    spreadMultiplier,
    breakevenGemRate,
    marginOfSafetyPct,
    upsideNet,
    downsideNet,
    riskRewardRatio,
    liquidityScore,
    confidenceTier,
  };
}

/**
 * Aggregates a bulk grading submission batch across multiple cards and quantities.
 */
export function calculateGradingBatchSummary(
  items: GradingBatchItem[],
  params: MarketParameters = DEFAULT_PARAMETERS
): GradingBatchSummary {
  let totalCards = 0;
  let totalRawCost = 0;
  let totalGradingFees = 0;
  let totalShippingFees = 0;
  let expectedGrossRevenue = 0;
  let expectedNetProfit = 0;
  let totalWeightedGemRate = 0;
  let worstCaseDownside = 0;
  let bestCaseUpside = 0;

  items.forEach((item) => {
    const qty = Math.max(1, item.quantity);
    const calc = calculateCardArbitrage(item.card, params);

    totalCards += qty;
    totalRawCost += calc.rawCost * qty;
    totalGradingFees += params.gradingFee * qty;
    totalShippingFees += params.shippingFee * qty;
    expectedGrossRevenue += calc.expectedRevenue * qty;
    expectedNetProfit += calc.expectedNetProfit * qty;
    totalWeightedGemRate += calc.p10 * qty;

    worstCaseDownside += calc.downsideNet * qty;
    bestCaseUpside += calc.upsideNet * qty;
  });

  const totalCapitalOutlay = totalRawCost + totalGradingFees + totalShippingFees;
  const blendedRoiPct = totalCapitalOutlay > 0 ? (expectedNetProfit / totalCapitalOutlay) * 100 : 0;
  const blendedGemRate = totalCards > 0 ? totalWeightedGemRate / totalCards : 0;

  return {
    totalCards,
    totalRawCost,
    totalGradingFees,
    totalShippingFees,
    totalCapitalOutlay,
    expectedGrossRevenue,
    expectedNetProfit,
    blendedRoiPct,
    blendedGemRate,
    worstCaseDownside,
    bestCaseUpside,
  };
}

/**
 * Computes a 5x4 Sensitivity Matrix testing Price Shocks against Gem Rate Shocks.
 */
export function generateSensitivityMatrix(
  card: CardRecord,
  params: MarketParameters = DEFAULT_PARAMETERS
): SensitivityMatrixCell[][] {
  const priceShocks = [-0.20, -0.10, 0.0, 0.10, 0.20]; // -20% to +20%
  const gemShocks = [-0.20, -0.10, 0.0, 0.10]; // -20% to +10%

  return gemShocks.map((gemShock) => {
    return priceShocks.map((priceShock) => {
      // Modify card comps
      const shockedCard: CardRecord = {
        ...card,
        psa_10: Math.max(0, Math.round(card.psa_10 * (1 + gemShock))),
        comps: {
          ...card.comps,
          psa_10_median: Math.max(1, Math.round(card.comps.psa_10_median * (1 + priceShock))),
        },
      };

      const res = calculateCardArbitrage(shockedCard, params);
      return {
        priceShockPct: priceShock * 100,
        gemShockPct: gemShock * 100,
        ev: res.expectedNetProfit,
        roiPct: res.roiPct,
      };
    });
  });
}

export function formatCurrency(value: number, decimals: number = 2): string {
  if (isNaN(value)) return '$0.00';
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

export function formatPercent(value: number, decimals: number = 1, showSign: boolean = false): string {
  if (isNaN(value)) return '0.0%';
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatWopr(value: number): string {
  if (isNaN(value)) return '0.000';
  return value.toFixed(3);
}

export function formatDelta(value: number): string {
  if (isNaN(value)) return '0.000';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(3)}`;
}
