export type SchemeType = 'Wide Zone' | 'Power Gap' | 'Spread Option' | 'Split-Safety' | 'Man Coverage';

export type GMArchetype = 'Analytics/Value GM' | 'Win-Now Aggressor' | 'Cap Conservative';

export type GMMood = 
  | 'Skeptical' 
  | 'Defensive' 
  | 'Intrigued' 
  | 'Pressured' 
  | 'Cornered' 
  | 'Ready to Sign' 
  | 'Walkout Risk';

export type ClientStatus = 
  | 'Pending Extension' 
  | 'Franchise Tagged' 
  | 'Unrestricted Free Agent' 
  | 'Signed' 
  | 'Impasse';

export interface ReplacementCostModel {
  draftCapitalCost: string;
  rookieVarianceDelta: string;
  capOpportunityCost: string;
  qbPressureDelta: string;
  pickWasted: string;
}

export interface ContractAsk {
  term: number; // years
  totalValue: number; // $M
  aav: number; // $M
  practicalGuarantees: number; // $M
  firstYearCashFlowPct: number; // %
}

export interface ContractComparable {
  player: string;
  team: string;
  aav: number;
  guarantees: number;
  year: number;
}

export interface WarRoomDossier {
  thesisStatement: string;
  leverageTimeline: string[];
  replacementCost: ReplacementCostModel;
  targetAsk: ContractAsk;
  comparables: ContractComparable[];
  keyStats: { label: string; value: string; rank?: string }[];
}

export interface ContractOffer {
  term: number; // 1-6 years
  aav: number; // $M/yr
  totalValue: number; // $M
  practicalGuarantees: number; // $M
  year1CashFlowPct: number; // % (e.g. 35 = 35%)
  lateYearEscapeHatch: boolean;
  incentiveEscalators: boolean;
}

export interface Client {
  id: string;
  name: string;
  position: 'OT' | 'S' | 'RB' | 'C' | 'EDGE' | 'WR';
  positionFull: string;
  age: number;
  team: string;
  teamLogoAbbr: string;
  rating: number;
  avatarUrl?: string;
  headshotUrl?: string;
  teamLogoUrl?: string;
  teamColor?: string;
  college?: string;
  dataSource?: 'spotrac' | 'nflverse' | 'hybrid';
  healthDurability: number; // 0-100
  schemeFitScore: number; // 0-100
  schemeType: SchemeType;
  publicLeverageScore: number; // 0-100
  patienceAndTrust: number; // 0-100
  currentStatus: ClientStatus;
  currentSalary: number; // $M
  warRoom: WarRoomDossier;
  signedContract?: ContractOffer;
}

export interface GMProfile {
  id: string;
  name: string;
  team: string;
  teamLogoUrl?: string;
  teamColor?: string;
  archetype: GMArchetype;
  philosophy: string;
  draftPick: string;
  teamCapSpace: number; // $M
  patience: number; // 0-100
  acceptanceScore: number; // 0-100
  currentMood: GMMood;
  currentStance: string;
}

export interface TacticalMove {
  id: string;
  title: string;
  category: 'EVIDENCE' | 'CONTINUITY' | 'STRUCTURE' | 'LEVERAGE_CLOCK';
  description: string;
  patienceImpact: number;
  acceptanceImpact: number;
  dialoguePrompt: string;
  gmResponse: (gm: GMProfile, client: Client) => string;
}

export interface NewsItem {
  id: string;
  phaseId: number;
  tag: 'CAP' | 'MARKET' | 'LEAK' | 'DRAFT' | 'CONTRACT';
  headline: string;
  detail: string;
}

export interface OffseasonPhase {
  id: number;
  name: string;
  shortName: string;
  description: string;
  daysRemaining: number;
  isDraft: boolean;
}

export interface AgencyStats {
  reputation: number; // 0-100
  activeClientsCount: number;
  commissionRevenue: number; // in $M (3% of guaranteed money)
  completedDeals: number;
  currentPhaseIndex: number;
}
