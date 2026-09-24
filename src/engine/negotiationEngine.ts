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
  const isJourneyman = client.tier === 'JOURNEYMAN' || client.contractType === 'PROVE_IT' || client.age >= 29;
  const isRookie = client.tier === 'ROOKIE' || client.contractType === 'ROOKIE_SCALE';
  let score = 50;

  // 1. AAV Evaluation
  const aavRatio = offer.aav / target.aav;
  if (aavRatio <= 0.82) {
    score += 28; // Substantial discount
  } else if (aavRatio <= 0.95) {
    score += 18; // Favorable team discount
  } else if (aavRatio <= 1.02) {
    score += 8; // Fair market ask
  } else if (aavRatio <= 1.12) {
    score -= 12; // Above market
  } else {
    score -= 28; // Egregious over-ask
  }

  // 2. Guarantee Ratio & Cap Health
  const guaranteeRatio = offer.practicalGuarantees / (offer.totalValue || 1);
  if (isJourneyman) {
    // On 1-year deals, guarantees don't create future dead money
    if (guaranteeRatio <= 0.70) score += 10;
    else if (guaranteeRatio > 0.85) score -= 8;
  } else if (isRookie) {
    // Top rookie contracts are almost entirely guaranteed by CBA convention
    if (guaranteeRatio >= 0.85) score += 5;
  } else {
    // Veteran multi-year extensions
    if (gm.archetype === 'Analytics/Value GM') {
      if (guaranteeRatio > 0.65) score -= 16;
      else if (guaranteeRatio < 0.50) score += 12;
    } else if (gm.archetype === 'Cap Conservative') {
      if (guaranteeRatio > 0.68) score -= 16;
      else if (guaranteeRatio <= 0.58) score += 10;
      if (offer.year1CashFlowPct > 42) score -= 14;
      else if (offer.year1CashFlowPct <= 36) score += 12;
    } else if (gm.archetype === 'Win-Now Aggressor') {
      if (guaranteeRatio > 0.72) score -= 6;
      else score += 10;
    }
  }

  // 3. Term Preferences
  if (isJourneyman) {
    // Journeymen are low-risk 1-2 year deals. 1 year is optimal for teams
    if (offer.term === 1) {
      score += 12; // Perfect prove-it term
    } else if (offer.term === 2) {
      score += 4;
    } else {
      score -= 20; // Teams refuse multi-year commitments to aging veterans
    }
  } else if (isRookie) {
    // Rookie contracts MUST be 4 years by CBA
    if (offer.term === 4) score += 15;
    else score -= 30;
  } else {
    // Star extensions
    if (offer.term >= 5) {
      if (client.age >= 28) score -= 14; // Aging superstar decline risk
      else score += 6; // Franchise cornerstone control
    } else if (offer.term === 3 || offer.term === 4) {
      score += 10; // Industry sweet spot
    } else if (offer.term <= 2) {
      if (gm.archetype === 'Win-Now Aggressor') score -= 12; // Wants multi-year window
    }
  }

  // 4. Structural Clauses
  if (offer.lateYearEscapeHatch) {
    score += gm.archetype === 'Cap Conservative' ? 14 : 8;
  }
  if (offer.incentiveEscalators) {
    score += 6;
  }

  // 5. Incorporate GM's existing acceptance momentum
  score = Math.round(score * 0.65 + gm.acceptanceScore * 0.35);

  return Math.max(0, Math.min(100, score));
}

export function evaluateContractOffer(
  offer: ContractOffer,
  client: Client,
  gm: GMProfile,
  previousGMCounter?: ContractOffer
): EvaluationResult {
  const score = calculateAcceptanceScore(offer, client, gm);
  const target = client.warRoom.targetAsk;
  const isJourneyman = client.tier === 'JOURNEYMAN' || client.contractType === 'PROVE_IT' || client.age >= 29;
  const isRookie = client.tier === 'ROOKIE' || client.contractType === 'ROOKIE_SCALE';

  // Client trust evaluation
  let clientTrustDelta = 0;
  const guaranteePercent = offer.practicalGuarantees / (offer.totalValue || 1);
  if (offer.aav >= target.aav && guaranteePercent >= 0.55) {
    clientTrustDelta = +8;
  } else if (offer.aav < target.aav * 0.80) {
    clientTrustDelta = -12; // Client insulted by lowball
  } else if (offer.lateYearEscapeHatch && guaranteePercent < 0.45) {
    clientTrustDelta = -6; // Client dislikes weak backend security
  }

  // Patience impact: over-ask drains GM patience, discount restores it
  let patienceDelta = 0;
  if (offer.aav > target.aav * 1.15) {
    patienceDelta = -14;
  } else if (offer.aav < target.aav * 0.90) {
    patienceDelta = +6;
  } else {
    patienceDelta = -4; // Standard round cost
  }

  // Acceptance Threshold
  if (score >= 68) {
    let gmDialogue = '';
    const lastName = client.name.split(' ').pop() || client.name;
    const teamName = client.team.split(' ').pop() || client.team;

    if (isJourneyman) {
      if (gm.archetype === 'Win-Now Aggressor') {
        gmDialogue = `"Done deal. ${client.name} gives us the exact veteran leadership and scheme depth we need for a playoff run. Send the paperwork over to the league office before the 4:00 PM wire."`;
      } else {
        gmDialogue = `"We have an agreement. The 1-year structure protects our future cap health while giving ${lastName} a premier platform to perform. Let's make it official."`;
      }
    } else if (isRookie) {
      gmDialogue = `"We are thrilled to welcome ${client.name} to the ${teamName} organization. The contract is executed under CBA rookie scale parameters. Let's get him in the building and onto the practice field."`;
    } else {
      // Star extension
      if (gm.archetype === 'Analytics/Value GM') {
        gmDialogue = `"Our analytical model confirms this distribution preserves surplus value over the life of the deal. We have an agreement. ${client.name} remains the cornerstone of our franchise."`;
      } else if (gm.archetype === 'Win-Now Aggressor') {
        gmDialogue = `"Done! Our coaching staff just let out a roar down the hall. We have secured our premier playmaker and preserved our championship window. Let's announce it before the afternoon cycle."`;
      } else {
        gmDialogue = `"It stretches our cash flow boundaries, but the structural compromises make it tenable. We agree to terms. ${client.name} will be a ${teamName} for years to come."`;
      }
    }

    return {
      accepted: true,
      score,
      patienceDelta: 0,
      clientTrustDelta: Math.max(clientTrustDelta, 10),
      gmResponse: gmDialogue
    };
  }

  // Not accepted: Generate realistic, anchored counter-offer
  // 1. Establish counter term appropriate for client tier
  let counterTerm = 1;
  if (isJourneyman) {
    counterTerm = 1; // Journeymen get 1-year prove-it deals
  } else if (isRookie) {
    counterTerm = 4; // Rookies get 4-year CBA slotted deals
  } else {
    counterTerm = Math.min(5, Math.max(3, offer.term || target.term));
  }

  // 2. Establish anchored counter AAV (GM moves UP toward player or holds firm, never drops)
  const initialGMBaseline = target.aav * (
    gm.archetype === 'Win-Now Aggressor' ? 0.92 :
    gm.archetype === 'Analytics/Value GM' ? 0.82 : 0.88
  );

  let anchorAAV = previousGMCounter ? previousGMCounter.aav : initialGMBaseline;

  // As the player moves closer, GM incrementally improves their offer to close the gap
  let counterAAV = anchorAAV;
  if (offer.aav <= target.aav * 1.10) {
    // Player made a reasonable move: GM creeps up by 2-5% of target AAV
    const step = Math.max(0.1, Math.round(target.aav * 0.03 * 10) / 10);
    counterAAV = Math.min(
      Math.round((offer.aav - step) * 10) / 10,
      Math.round((anchorAAV + step) * 10) / 10
    );
    counterAAV = Math.max(counterAAV, anchorAAV); // Never drop below prior offer
  }
  counterAAV = Math.round(counterAAV * 10) / 10;

  // 3. Counter Totals and Guarantees
  const counterTotal = Math.round(counterAAV * counterTerm * 10) / 10;
  let counterGtdRatio = 0.55;
  if (isJourneyman) counterGtdRatio = 0.65;
  else if (isRookie) counterGtdRatio = 0.90;
  else if (gm.archetype === 'Win-Now Aggressor') counterGtdRatio = 0.62;
  else if (gm.archetype === 'Cap Conservative') counterGtdRatio = 0.48;

  const counterGtd = Math.round(counterTotal * counterGtdRatio * 10) / 10;

  const counterOffer: ContractOffer = {
    term: counterTerm,
    aav: counterAAV,
    totalValue: counterTotal,
    practicalGuarantees: counterGtd,
    year1CashFlowPct: isJourneyman ? 100 : 35,
    lateYearEscapeHatch: !isJourneyman,
    incentiveEscalators: true
  };

  // 4. Character-driven contextual pushback dialogue
  let pushbackDialogue = '';
  const firstName = client.name.split(' ')[0];

  if (isJourneyman) {
    if (offer.term > 2) {
      pushbackDialogue = `"We cannot authorize a ${offer.term}-year commitment for a ${client.age}-year-old veteran. Our offer is strictly a 1-year prove-it deal: 1 year, $${counterTotal}M with $${counterGtd}M guaranteed plus per-game roster bonuses."`;
    } else if (offer.aav > target.aav) {
      pushbackDialogue = `"$${offer.aav}M AAV exceeds our remaining preseason cap reserve for ${client.position}. We want ${firstName} in our secondary, but we must stay at 1 year / $${counterAAV}M with $${counterGtd}M guaranteed. We can add $1.5M in playoff escalators to bridge the gap."`;
    } else {
      pushbackDialogue = `"We're very close to finalizing. If you meet us at $${counterAAV}M with $${counterGtd}M practically guaranteed, we'll sign off on the incentive triggers and get ${firstName} suited up."`;
    }
  } else if (isRookie) {
    pushbackDialogue = `"The total value is locked by the CBA slotted scale. We can do 4 years / $${counterTotal}M total. Let's resolve the signing bonus distribution and offset language so we can avoid missing valuable practice reps."`;
  } else {
    // Star multi-year extension
    if (offer.aav > target.aav * 1.08) {
      pushbackDialogue = `"$${offer.aav}M AAV completely breaks our positional ceiling for ${client.position}. We can't alienate our entire locker room cap hierarchy. Here is what we can realistically authorize: ${counterTerm} years, $${counterTotal}M total ($${counterAAV}M AAV) with $${counterGtd}M practically guaranteed."`;
    } else if (guaranteePercent > 0.65 && gm.archetype === 'Cap Conservative') {
      pushbackDialogue = `"We can't commit that much dead money in the backend of the deal. We need rolling guarantees that vest in March, not fully guaranteed up front. Meet us closer to $${counterGtd}M in guarantees and we can finalize."`;
    } else {
      pushbackDialogue = `"We're inching closer to a resolution. We counter at ${counterTerm} years / $${counterAAV}M AAV ($${counterTotal}M total) with $${counterGtd}M guaranteed. Let's find common ground before the holdout costs escalate."`;
    }
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

