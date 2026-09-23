import { Client, GMProfile, ContractOffer } from '../types/game';

export interface EvaluationResult {
  accepted: boolean;
  score: number; // 0-100
  patienceDelta: number;
  clientTrustDelta: number;
  gmResponse: string;
  counterOffer?: ContractOffer;
}

export function calculateAcceptanceScore(
  offer: ContractOffer,
  client: Client,
  gm: GMProfile
): number {
  const target = client.warRoom.targetAsk;
  let score = 50;

  // 1. AAV Comparison (Higher AAV reduces GM acceptance, but GM archetype reacts differently)
  const aavRatio = offer.aav / target.aav;
  if (aavRatio <= 0.80) {
    score += 30; // GM loves massive discount
  } else if (aavRatio <= 0.92) {
    score += 18;
  } else if (aavRatio <= 1.0) {
    score += 5; // Fair market ask
  } else if (aavRatio <= 1.12) {
    score -= 15; // Above market
  } else {
    score -= 32; // Egregious over-ask
  }

  // 2. Guarantee Ratio (Guarantees as % of total value)
  const guaranteeRatio = offer.practicalGuarantees / (offer.totalValue || 1);
  const targetGuaranteeRatio = target.practicalGuarantees / target.totalValue;

  if (gm.archetype === 'Analytics/Value GM') {
    // Analytics GMs hate dead cap risk and high guarantee percentages
    if (guaranteeRatio > 0.65) score -= 14;
    else if (guaranteeRatio < 0.50) score += 12;
  } else if (gm.archetype === 'Cap Conservative') {
    // Cap conservative hates both high total guarantees and high cash flow
    if (guaranteeRatio > 0.60) score -= 18;
    if (offer.year1CashFlowPct > 42) score -= 15;
    else if (offer.year1CashFlowPct < 32) score += 14;
  } else if (gm.archetype === 'Win-Now Aggressor') {
    // Aggressors are willing to guarantee high money if AAV is manageable
    if (guaranteeRatio > 0.70) score -= 8;
    else score += 10;
  }

  // 3. Term preferences
  if (offer.term >= 5) {
    if (client.age >= 26) score -= 10; // Aging player risk
    else score += 5; // Long-term control
  } else if (offer.term === 3 || offer.term === 4) {
    score += 8; // Sweet spot for most teams
  } else if (offer.term <= 2) {
    if (gm.archetype === 'Win-Now Aggressor') score -= 12; // Wants continuity
  }

  // 4. Structural Clauses
  if (offer.lateYearEscapeHatch) {
    if (gm.archetype === 'Cap Conservative') score += 16;
    else score += 8;
  }

  if (offer.incentiveEscalators) {
    score += 6;
  }

  // 5. Incorporate GM's existing acceptance momentum
  score = Math.round(score * 0.6 + gm.acceptanceScore * 0.4);

  return Math.max(0, Math.min(100, score));
}

export function evaluateContractOffer(
  offer: ContractOffer,
  client: Client,
  gm: GMProfile
): EvaluationResult {
  const score = calculateAcceptanceScore(offer, client, gm);
  const target = client.warRoom.targetAsk;

  // Client trust evaluation
  let clientTrustDelta = 0;
  const guaranteePercent = offer.practicalGuarantees / (offer.totalValue || 1);
  if (offer.aav >= target.aav && guaranteePercent >= 0.60) {
    clientTrustDelta = +8;
  } else if (offer.aav < target.aav * 0.85) {
    clientTrustDelta = -12; // Client insulted by lowball
  } else if (offer.lateYearEscapeHatch && guaranteePercent < 0.50) {
    clientTrustDelta = -6; // Client dislikes weak backend security
  }

  // Patience impact: lowball or over-ask drains GM patience
  let patienceDelta = 0;
  if (offer.aav > target.aav * 1.15) {
    patienceDelta = -15; // GM feels insulted
  } else if (offer.aav < target.aav * 0.85) {
    patienceDelta = +5; // GM intrigued by discount
  } else {
    patienceDelta = -4; // Standard round cost
  }

  // Accepted threshold: typically >= 72
  if (score >= 70) {
    let gmDialogue = '';
    if (gm.archetype === 'Analytics/Value GM') {
      gmDialogue = `"We ran this through our roster optimization engine. The cap hit distribution and replacement value threshold align with our projections. You have a deal. Send the paperwork over to league headquarters."`;
    } else if (gm.archetype === 'Win-Now Aggressor') {
      gmDialogue = `"Done. Our head coach just pumped his fist in the hall. We have protected our window and locked up a premier foundational piece. Let's announce it before the afternoon cycle."`;
    } else {
      gmDialogue = `"It stretches our 3-year cash flow boundary, but the structural compromises make it tenable. We agree to terms. Marcus remains our cornerstone."`;
    }

    return {
      accepted: true,
      score,
      patienceDelta: 0,
      clientTrustDelta: Math.max(clientTrustDelta, 10),
      gmResponse: gmDialogue
    };
  }

  // Not accepted: Generate counter-offer and feedback
  const counterAAV = Math.round((offer.aav * 0.82 + target.aav * 0.8) / 2 * 10) / 10;
  const counterTerm = Math.min(4, Math.max(3, offer.term));
  const counterTotal = Math.round(counterAAV * counterTerm * 10) / 10;
  const counterGtd = Math.round(counterTotal * 0.52 * 10) / 10;

  const counterOffer: ContractOffer = {
    term: counterTerm,
    aav: counterAAV,
    totalValue: counterTotal,
    practicalGuarantees: counterGtd,
    year1CashFlowPct: 34,
    lateYearEscapeHatch: true,
    incentiveEscalators: true
  };

  let pushbackDialogue = '';
  if (offer.aav > target.aav) {
    pushbackDialogue = `"${offer.aav}M AAV completely breaks our positional ceiling. We can't alienate our entire locker room cap hierarchy. Here is what we can realistically authorize: ${counterTerm} years, $${counterTotal}M total ($${counterAAV}M AAV) with $${counterGtd}M practically guaranteed."`;
  } else if (guaranteePercent > 0.65 && gm.archetype === 'Cap Conservative') {
    pushbackDialogue = `"We can't commit that much dead money in Years 3 and 4. We need rolling guarantees that vest in March, not fully guaranteed up front. Meet us closer to $${counterGtd}M in guarantees and we can finalize."`;
  } else {
    pushbackDialogue = `"We're inching closer, but the numbers still don't quite balance against our draft alternative models. We counter at ${counterTerm} years / $${counterAAV}M AAV with $${counterGtd}M guaranteed."`;
  }

  return {
    accepted: false,
    score,
    patienceDelta,
    clientTrustDelta,
    gmResponse: pushbackDialogue,
    counterOffer
  };
}
