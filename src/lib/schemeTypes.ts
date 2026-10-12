import { CombineProspect } from './combineTypes';

export type SchemeCategory = 'OFFENSE' | 'DEFENSE';

export interface SchemeWeights {
  deceleration_weight: number;      // DEI / Short Shuttle braking
  apex_bend_weight: number;          // EBI / 3-cone cornering load
  hip_fluidity_weight: number;       // FI / Transition lag
  trench_impulse_weight: number;     // TEI / 10-yd first-step impulse
  straight_line_weight: number;      // 40-yd dash raw speed
  size_weight: number;               // Height / Weight / Arm length
}

export interface SchemeThresholds {
  min_arm_length?: number;
  min_weight_lbs?: number;
  max_forty_sec?: number;
  min_dei?: number;
  min_ebi?: number;
  min_fi?: number;
  min_tei?: number;
}

export interface SchemeDefinition {
  id: string;
  name: string;
  category: SchemeCategory;
  short_name: string;
  coordinator_influences: string[];
  key_philosophies: string[];
  ideal_archetypes: string[];
  weights: SchemeWeights;
  thresholds: SchemeThresholds;
  description: string;
}

export interface NFLTeamProfile {
  id: string;
  city: string;
  name: string;
  abbreviation: string;
  head_coach: string;
  offensive_coordinator: string;
  defensive_coordinator: string;
  primary_offense_scheme_id: string;
  primary_defense_scheme_id: string;
  primary_color: string;
  secondary_color: string;
  draft_needs: string[];
  scouting_notes: string;
}

export interface SchemeFitResult {
  prospect: CombineProspect;
  fit_score: number;                // 0 to 100
  tier: 'ELITE_FIT' | 'STRONG_FIT' | 'ROLE_SPECIFIC' | 'SCHEME_MISFIT';
  primary_driver: string;
  strengths: string[];
  concerns: string[];
  scouting_diagnosis: string;
}

// Preset NFL Scheme Archetypes
export const NFL_SCHEME_ARCHETYPES: SchemeDefinition[] = [
  {
    id: 'shanahan_outside_zone',
    name: 'Outside Zone & Play-Action Timing',
    category: 'OFFENSE',
    short_name: 'Shanahan / McVay Zone',
    coordinator_influences: ['Kyle Shanahan', 'Sean McVay', 'Mike McDaniel', 'Bobby Slowik', 'Matt LaFleur'],
    key_philosophies: [
      'Violent stem-break deceleration over straight-line track speed',
      'Instantaneous lateral cut on wide zone stretch',
      'Timing and rhythm passing demanding crisp 2-stride separation'
    ],
    ideal_archetypes: ['WR', 'TE', 'RB', 'OT', 'IOL'],
    weights: {
      deceleration_weight: 0.40,
      apex_bend_weight: 0.15,
      hip_fluidity_weight: 0.15,
      trench_impulse_weight: 0.15,
      straight_line_weight: 0.10,
      size_weight: 0.05
    },
    thresholds: {
      min_dei: 12.0
    },
    description: 'Demands elite deceleration and sudden change-of-direction. Receivers must stop on a dime at 12-15 yards to create windows for timing quarterbacks.'
  },
  {
    id: 'vertical_air_coryell',
    name: 'Vertical Spread / Air Coryell',
    category: 'OFFENSE',
    short_name: 'Vertical Spread',
    coordinator_influences: ['Joe Brady', 'Brian Schottenheimer', 'Kellen Moore', 'Todd Monken'],
    key_philosophies: [
      'Field-tilting top-end straight-line velocity',
      'Explosive boundary separation and ball-tracking',
      'Stout pass-protection anchors at tackle'
    ],
    ideal_archetypes: ['WR', 'OT', 'TE', 'QB'],
    weights: {
      deceleration_weight: 0.10,
      apex_bend_weight: 0.10,
      hip_fluidity_weight: 0.10,
      trench_impulse_weight: 0.15,
      straight_line_weight: 0.45,
      size_weight: 0.10
    },
    thresholds: {
      max_forty_sec: 4.45
    },
    description: 'Prioritizes raw 40-yard dash burst and sustained acceleration to stress two-high safety shells and generate explosive +20-yard gains.'
  },
  {
    id: 'power_gap_trench',
    name: 'Power-Gap & Downhill Trench',
    category: 'OFFENSE',
    short_name: 'Power-Gap',
    coordinator_influences: ['Greg Roman', 'Arthur Smith', 'Jim Harbaugh', 'Klint Kubiak'],
    key_philosophies: [
      'Line-of-scrimmage displacement and first-step momentum',
      'Heavy mass with instantaneous kinetic impulse',
      'Punishing yards after contact'
    ],
    ideal_archetypes: ['RB', 'IOL', 'OT', 'TE', 'FB'],
    weights: {
      deceleration_weight: 0.05,
      apex_bend_weight: 0.10,
      hip_fluidity_weight: 0.05,
      trench_impulse_weight: 0.45,
      straight_line_weight: 0.10,
      size_weight: 0.25
    },
    thresholds: {
      min_tei: 12.0,
      min_weight_lbs: 215
    },
    description: 'Built on raw physical mass and initial 0.5-second impulse. Displaces defensive linemen to open interior A/B gap creases.'
  },
  {
    id: 'quick_game_spread',
    name: 'Quick-Game Spread & Slot Mesh',
    category: 'OFFENSE',
    short_name: 'Quick Spread',
    coordinator_influences: ['Andy Reid', 'Kliff Kingsbury', 'Zac Taylor', 'Shane Steichen'],
    key_philosophies: [
      'High-frequency short-area separation in compressed windows',
      'YAC agility and instant acceleration out of the catch',
      'Shuttle speed to beat press brackets inside'
    ],
    ideal_archetypes: ['WR', 'RB', 'TE'],
    weights: {
      deceleration_weight: 0.35,
      apex_bend_weight: 0.20,
      hip_fluidity_weight: 0.20,
      trench_impulse_weight: 0.10,
      straight_line_weight: 0.10,
      size_weight: 0.05
    },
    thresholds: {},
    description: 'Requires rapid lateral redirect and underneath route separation to sustain high-completion percentage passing offenses.'
  },
  {
    id: 'fangio_quarters_match',
    name: 'Vic Fangio Quarters & Cover 3 Match',
    category: 'DEFENSE',
    short_name: 'Fangio Quarters',
    coordinator_influences: ['Vic Fangio', 'Ejiro Evero', 'Sean Desai', 'Renaldo Hill', 'Brandon Staley'],
    key_philosophies: [
      'Hip fluidity with zero transition latency passing off crossers',
      'Vision and route recognition in two-high safety shells',
      'Disciplined containment rush with balanced front mechanics'
    ],
    ideal_archetypes: ['CB', 'S', 'LB', 'EDGE'],
    weights: {
      deceleration_weight: 0.10,
      apex_bend_weight: 0.20,
      hip_fluidity_weight: 0.45,
      trench_impulse_weight: 0.10,
      straight_line_weight: 0.10,
      size_weight: 0.05
    },
    thresholds: {
      min_fi: 14.0
    },
    description: 'Demands cornerbacks and safeties with seamless hip flip mechanics (low latency τ). Eradicates explosive plays over the top.'
  },
  {
    id: 'spagnuolo_press_man_blitz',
    name: 'Aggressive Press-Man & Overload Blitz',
    category: 'DEFENSE',
    short_name: 'Spags / Flores Blitz',
    coordinator_influences: ['Steve Spagnuolo', 'Brian Flores', 'Jim Schwartz', 'Mike Macdonald'],
    key_philosophies: [
      'Physical line-of-scrimmage jam and recovery burst',
      'Isolated 1-on-1 edge rush win rate on quick pass sets',
      'Length and arm extension to contest at catch point'
    ],
    ideal_archetypes: ['CB', 'EDGE', 'DT', 'S'],
    weights: {
      deceleration_weight: 0.10,
      apex_bend_weight: 0.35,
      hip_fluidity_weight: 0.25,
      trench_impulse_weight: 0.10,
      straight_line_weight: 0.15,
      size_weight: 0.05
    },
    thresholds: {
      min_arm_length: 31.0
    },
    description: 'Requires long, physical cornerbacks who can survive on an island in Cover 1 / Cover 0 while rushers win on rapid edge bend.'
  },
  {
    id: 'schwartz_wide9_attack',
    name: 'Wide-9 Attack Front (Penetration)',
    category: 'DEFENSE',
    short_name: 'Wide-9 Penetration',
    coordinator_influences: ['Jim Schwartz', 'Kris Kocurek', 'Robert Saleh', 'Nick Sorensen'],
    key_philosophies: [
      'Extreme cornering arc load around offensive tackles',
      'First-step get-off and relentless motor',
      'One-gap interior explosion splitting double teams'
    ],
    ideal_archetypes: ['EDGE', 'DE', 'DT'],
    weights: {
      deceleration_weight: 0.05,
      apex_bend_weight: 0.55,
      hip_fluidity_weight: 0.05,
      trench_impulse_weight: 0.20,
      straight_line_weight: 0.10,
      size_weight: 0.05
    },
    thresholds: {
      min_ebi: 90.0
    },
    description: 'Lines defensive ends in wide alignments to force 1-on-1 tackles. Demands extreme ankle tilt bend (EBI) to flatten to the quarterback.'
  },
  {
    id: 'two_gap_34_anchor',
    name: '3-4 Two-Gap Heavy Trench',
    category: 'DEFENSE',
    short_name: '3-4 Two-Gap',
    coordinator_influences: ['Mike Tomlin', 'Bill Belichick', 'Wink Martindale', 'Patrick Graham'],
    key_philosophies: [
      'Stout mass and anchor to control two offensive gaps',
      'Upper-body bench power to shed interior blocks',
      'Downhill collision force stuffing inside zone'
    ],
    ideal_archetypes: ['DT', 'DE', 'NT', 'LB'],
    weights: {
      deceleration_weight: 0.05,
      apex_bend_weight: 0.10,
      hip_fluidity_weight: 0.05,
      trench_impulse_weight: 0.40,
      straight_line_weight: 0.05,
      size_weight: 0.35
    },
    thresholds: {
      min_weight_lbs: 300
    },
    description: 'Prioritizes raw girth, bench press lockout power, and anchor leverage to absorb double-teams and free inside linebackers.'
  }
];

// All 32 NFL Teams with their tactical coordinator schemes
export const NFL_TEAMS_DATABASE: NFLTeamProfile[] = [
  {
    id: 'SF',
    city: 'San Francisco',
    name: '49ers',
    abbreviation: 'SF',
    head_coach: 'Kyle Shanahan',
    offensive_coordinator: 'Kyle Shanahan',
    defensive_coordinator: 'Nick Sorensen',
    primary_offense_scheme_id: 'shanahan_outside_zone',
    primary_defense_scheme_id: 'schwartz_wide9_attack',
    primary_color: '#AA0000',
    secondary_color: '#B3995D',
    draft_needs: ['OT', 'CB', 'EDGE', 'IOL'],
    scouting_notes: 'Demands elite DEI deceleration on in-breaking route stems and Wide-9 edge bend velocity.'
  },
  {
    id: 'KC',
    city: 'Kansas City',
    name: 'Chiefs',
    abbreviation: 'KC',
    head_coach: 'Andy Reid',
    offensive_coordinator: 'Matt Nagy',
    defensive_coordinator: 'Steve Spagnuolo',
    primary_offense_scheme_id: 'quick_game_spread',
    primary_defense_scheme_id: 'spagnuolo_press_man_blitz',
    primary_color: '#E31837',
    secondary_color: '#FFB81C',
    draft_needs: ['WR', 'OT', 'CB', 'DT'],
    scouting_notes: 'Prioritizes YAC separation receivers and long, physical press-man corners with high blitz-read speed.'
  },
  {
    id: 'BAL',
    city: 'Baltimore',
    name: 'Ravens',
    abbreviation: 'BAL',
    head_coach: 'John Harbaugh',
    offensive_coordinator: 'Todd Monken',
    defensive_coordinator: 'Zach Orr',
    primary_offense_scheme_id: 'power_gap_trench',
    primary_defense_scheme_id: 'spagnuolo_press_man_blitz',
    primary_color: '#241773',
    secondary_color: '#9E7C0C',
    draft_needs: ['EDGE', 'IOL', 'CB', 'WR'],
    scouting_notes: 'Heavy trench knockback (TEI) and aggressive Cover 1/0 boundary press cornerbacks.'
  },
  {
    id: 'DET',
    city: 'Detroit',
    name: 'Lions',
    abbreviation: 'DET',
    head_coach: 'Dan Campbell',
    offensive_coordinator: 'Ben Johnson',
    defensive_coordinator: 'Aaron Glenn',
    primary_offense_scheme_id: 'power_gap_trench',
    primary_defense_scheme_id: 'schwartz_wide9_attack',
    primary_color: '#0076B6',
    secondary_color: '#B0B7BC',
    draft_needs: ['EDGE', 'CB', 'IOL', 'WR'],
    scouting_notes: 'Downhill physical power combined with relentless pass-rush bend.'
  },
  {
    id: 'PHI',
    city: 'Philadelphia',
    name: 'Eagles',
    abbreviation: 'PHI',
    head_coach: 'Nick Sirianni',
    offensive_coordinator: 'Kellen Moore',
    defensive_coordinator: 'Vic Fangio',
    primary_offense_scheme_id: 'vertical_air_coryell',
    primary_defense_scheme_id: 'fangio_quarters_match',
    primary_color: '#004C54',
    secondary_color: '#A5ACAF',
    draft_needs: ['CB', 'EDGE', 'OT', 'LB'],
    scouting_notes: 'Deep field vertical speed paired with Fangio two-high quarters fluidity.'
  },
  {
    id: 'MIA',
    city: 'Miami',
    name: 'Dolphins',
    abbreviation: 'MIA',
    head_coach: 'Mike McDaniel',
    offensive_coordinator: 'Frank Smith',
    defensive_coordinator: 'Anthony Weaver',
    primary_offense_scheme_id: 'shanahan_outside_zone',
    primary_defense_scheme_id: 'spagnuolo_press_man_blitz',
    primary_color: '#008E97',
    secondary_color: '#FC4C02',
    draft_needs: ['IOL', 'DT', 'EDGE', 'CB'],
    scouting_notes: 'World-class straight-line speed combined with sharp deceleration on motion snaps.'
  },
  {
    id: 'GB',
    city: 'Green Bay',
    name: 'Packers',
    abbreviation: 'GB',
    head_coach: 'Matt LaFleur',
    offensive_coordinator: 'Adam Stenavich',
    defensive_coordinator: 'Jeff Hafley',
    primary_offense_scheme_id: 'shanahan_outside_zone',
    primary_defense_scheme_id: 'fangio_quarters_match',
    primary_color: '#203731',
    secondary_color: '#FFB612',
    draft_needs: ['OT', 'CB', 'EDGE', 'S'],
    scouting_notes: 'Historically strict RAS athletic thresholds; prioritizes DEI separation receivers like Jayden Reed.'
  },
  {
    id: 'CLE',
    city: 'Cleveland',
    name: 'Browns',
    abbreviation: 'CLE',
    head_coach: 'Kevin Stefanski',
    offensive_coordinator: 'Ken Dorsey',
    defensive_coordinator: 'Jim Schwartz',
    primary_offense_scheme_id: 'shanahan_outside_zone',
    primary_defense_scheme_id: 'schwartz_wide9_attack',
    primary_color: '#311D00',
    secondary_color: '#FF3C00',
    draft_needs: ['OT', 'WR', 'DT', 'LB'],
    scouting_notes: 'Classic Jim Schwartz Wide-9 front demanding maximum edge bend (EBI) and explosive get-off.'
  },
  {
    id: 'HOU',
    city: 'Houston',
    name: 'Texans',
    abbreviation: 'HOU',
    head_coach: 'DeMeco Ryans',
    offensive_coordinator: 'Bobby Slowik',
    defensive_coordinator: 'Matt Burke',
    primary_offense_scheme_id: 'shanahan_outside_zone',
    primary_defense_scheme_id: 'schwartz_wide9_attack',
    primary_color: '#03202F',
    secondary_color: '#A71930',
    draft_needs: ['DT', 'IOL', 'CB', 'S'],
    scouting_notes: 'Slowik outside zone playbook coupled with DeMeco Ryans aggressive attack front.'
  },
  {
    id: 'BUF',
    city: 'Buffalo',
    name: 'Bills',
    abbreviation: 'BUF',
    head_coach: 'Sean McDermott',
    offensive_coordinator: 'Joe Brady',
    defensive_coordinator: 'Bobby Babich',
    primary_offense_scheme_id: 'vertical_air_coryell',
    primary_defense_scheme_id: 'fangio_quarters_match',
    primary_color: '#00338D',
    secondary_color: '#C60C30',
    draft_needs: ['WR', 'EDGE', 'CB', 'S'],
    scouting_notes: 'Vertical boundary speed coupled with disciplined Cover 2/4 match DB fluidity.'
  },
  {
    id: 'PIT',
    city: 'Pittsburgh',
    name: 'Steelers',
    abbreviation: 'PIT',
    head_coach: 'Mike Tomlin',
    offensive_coordinator: 'Arthur Smith',
    defensive_coordinator: 'Teryl Austin',
    primary_offense_scheme_id: 'power_gap_trench',
    primary_defense_scheme_id: 'two_gap_34_anchor',
    primary_color: '#FFB612',
    secondary_color: '#101820',
    draft_needs: ['WR', 'CB', 'DL', 'QB'],
    scouting_notes: 'Heavy physical downhill football; Arthur Smith wide-zone/gap mashup with 3-4 interior anchors.'
  },
  {
    id: 'DAL',
    city: 'Dallas',
    name: 'Cowboys',
    abbreviation: 'DAL',
    head_coach: 'Mike McCarthy',
    offensive_coordinator: 'Brian Schottenheimer',
    defensive_coordinator: 'Mike Zimmer',
    primary_offense_scheme_id: 'vertical_air_coryell',
    primary_defense_scheme_id: 'fangio_quarters_match',
    primary_color: '#003594',
    secondary_color: '#041E42',
    draft_needs: ['RB', 'DT', 'EDGE', 'WR'],
    scouting_notes: 'Air Coryell vertical passing concepts with Zimmer disciplined zone front.'
  }
];

// Core Mathematical Scheme Fit Scoring Engine
export function calculateSchemeFit(
  prospect: CombineProspect,
  scheme: SchemeDefinition
): SchemeFitResult {
  const w = scheme.weights;
  const drills = prospect.drills;
  const kin = prospect.kinematics;
  const meas = prospect.measurements;

  let score = 0;
  let totalWeights = 0;
  const strengths: string[] = [];
  const concerns: string[] = [];

  // 1. Deceleration Dimension (DEI or Short Shuttle)
  if (w.deceleration_weight > 0) {
    let decelScore = 50;
    if (kin.archetype === 'wr' && kin.kin_score !== null) {
      // DEI range: 0 to 45 (mean ~15, 30+ elite)
      decelScore = Math.min(100, Math.max(0, (kin.kin_score / 35) * 100));
      if (kin.kin_score >= 18.0) strengths.push(`Elite Decel Efficiency (DEI: ${kin.kin_score.toFixed(1)})`);
      else if (kin.kin_score < 10.0) concerns.push(`Below-average braking efficiency (DEI: ${kin.kin_score.toFixed(1)})`);
    } else if (drills.pct_shuttle !== null) {
      decelScore = drills.pct_shuttle;
      if (drills.pct_shuttle >= 80) strengths.push(`Top-decile Short Shuttle (${drills.short_shuttle}s)`);
    }
    score += decelScore * w.deceleration_weight;
    totalWeights += w.deceleration_weight;
  }

  // 2. Apex Bend Dimension (EBI or 3-Cone)
  if (w.apex_bend_weight > 0) {
    let bendScore = 50;
    if (kin.archetype === 'edge' && kin.kin_score !== null) {
      // EBI range: 0 to 250 (mean ~90, 150+ elite)
      bendScore = Math.min(100, Math.max(0, (kin.kin_score / 200) * 100));
      if (kin.kin_score >= 130.0) strengths.push(`High Cornering Arc Bend (EBI: ${kin.kin_score.toFixed(1)})`);
      else if (kin.kin_score < 70.0) concerns.push(`Stiff apex turning mechanics (EBI: ${kin.kin_score.toFixed(1)})`);
    } else if (drills.pct_three_cone !== null) {
      bendScore = drills.pct_three_cone;
      if (drills.pct_three_cone >= 80) strengths.push(`Sub-7.0s 3-Cone Drill agility (${drills.three_cone}s)`);
    }
    score += bendScore * w.apex_bend_weight;
    totalWeights += w.apex_bend_weight;
  }

  // 3. Hip Fluidity Dimension (FI or 40-yd transition)
  if (w.hip_fluidity_weight > 0) {
    let fluidityScore = 50;
    if (kin.archetype === 'cb' && kin.kin_score !== null) {
      // FI range: 0 to 30 (mean ~13, 20+ elite)
      fluidityScore = Math.min(100, Math.max(0, (kin.kin_score / 22) * 100));
      if (kin.kin_score >= 15.0) strengths.push(`Seamless Hip Transition Fluidity (FI: ${kin.kin_score.toFixed(1)})`);
      else if (kin.kin_score < 9.0) concerns.push(`High transition phase latency (FI: ${kin.kin_score.toFixed(1)})`);
    } else if (drills.pct_forty !== null) {
      fluidityScore = drills.pct_forty;
    }
    score += fluidityScore * w.hip_fluidity_weight;
    totalWeights += w.hip_fluidity_weight;
  }

  // 4. Trench Impulse Dimension (TEI or 10-yd split)
  if (w.trench_impulse_weight > 0) {
    let impulseScore = 50;
    if (kin.archetype === 'trench' && kin.kin_score !== null) {
      // TEI range: 0 to 25 (mean ~11, 16+ elite)
      impulseScore = Math.min(100, Math.max(0, (kin.kin_score / 20) * 100));
      if (kin.kin_score >= 14.0) strengths.push(`Instantaneous Line Impulse (TEI: ${kin.kin_score.toFixed(1)})`);
      else if (kin.kin_score < 7.0) concerns.push(`Low first-step pad leverage (TEI: ${kin.kin_score.toFixed(1)})`);
    } else if (drills.pct_ten_split !== null) {
      impulseScore = drills.pct_ten_split;
      if (drills.pct_ten_split >= 80) strengths.push(`Explosive 10-yard split (${drills.ten_yd_split}s)`);
    }
    score += impulseScore * w.trench_impulse_weight;
    totalWeights += w.trench_impulse_weight;
  }

  // 5. Straight Line Raw Velocity Dimension
  if (w.straight_line_weight > 0) {
    const rawSpeedScore = drills.pct_forty ?? prospect.athletic_score;
    if (drills.forty !== null && drills.forty <= 4.40) {
      strengths.push(`Blistering straight-line velocity (${drills.forty}s 40-yd)`);
    } else if (drills.forty !== null && drills.forty > 4.65 && ['WR', 'CB'].includes(prospect.position)) {
      concerns.push(`Modest boundary track speed (${drills.forty}s 40-yd)`);
    }
    score += rawSpeedScore * w.straight_line_weight;
    totalWeights += w.straight_line_weight;
  }

  // 6. Size & Length Threshold Dimension
  if (w.size_weight > 0) {
    let sizeScore = 60;
    if (meas.weight_lbs) {
      if (['OT', 'IOL', 'DT'].includes(prospect.position) && meas.weight_lbs >= 315) sizeScore += 25;
      if (['RB'].includes(prospect.position) && meas.weight_lbs >= 215) sizeScore += 20;
    }
    if (meas.arm_length && meas.arm_length >= 33.0) {
      sizeScore += 15;
      strengths.push(`Plus length (Arm: ${meas.arm_length.toFixed(1)}")`);
    }
    score += Math.min(100, sizeScore) * w.size_weight;
    totalWeights += w.size_weight;
  }

  // Check Hard Thresholds
  let thresholdPenalty = 0;
  if (scheme.thresholds.min_arm_length && meas.arm_length && meas.arm_length < scheme.thresholds.min_arm_length) {
    concerns.push(`Below team minimum arm threshold (${meas.arm_length.toFixed(1)}" < ${scheme.thresholds.min_arm_length}")`);
    thresholdPenalty += 8;
  }
  if (scheme.thresholds.max_forty_sec && drills.forty && drills.forty > scheme.thresholds.max_forty_sec) {
    concerns.push(`Exceeds vertical speed cutoff (${drills.forty}s > ${scheme.thresholds.max_forty_sec}s)`);
    thresholdPenalty += 10;
  }

  // Empirical SumerSports Historical Combine Thresholds
  if (prospect.position === 'QB' && drills.broad_jump !== null) {
    if (drills.broad_jump < 110) {
      concerns.push(`Broad Jump below 110" starter threshold (${drills.broad_jump}")`);
      thresholdPenalty += 5;
    } else if (drills.broad_jump >= 120) {
      strengths.push(`Plus lower-body kinetic chain explosion (${drills.broad_jump}" broad jump)`);
    }
  }

  if (prospect.position === 'TE') {
    if (drills.broad_jump !== null && drills.broad_jump < 120) {
      concerns.push(`Broad jump under 120" limits Round 1 projection (${drills.broad_jump}")`);
      thresholdPenalty += 4;
    }
    if (drills.forty !== null && drills.forty > 4.70) {
      concerns.push(`40-yd dash > 4.70s caps space mismatch utility (${drills.forty}s)`);
      thresholdPenalty += 6;
    }
  }

  if (prospect.position === 'OT' && drills.forty !== null && drills.forty > 5.40) {
    concerns.push(`40-yd dash exceeds 5.4s climbing cutoff (${drills.forty}s)`);
    thresholdPenalty += 6;
  }

  if (['IOL', 'G', 'C'].includes(prospect.position)) {
    if (drills.short_shuttle !== null && drills.short_shuttle > 4.80) {
      concerns.push(`Shuttle time exceeds 4.80s guard cutoff (${drills.short_shuttle}s)`);
      thresholdPenalty += 5;
    }
    if (drills.three_cone !== null && drills.three_cone > 7.80) {
      concerns.push(`3-Cone drill exceeds 7.80s redirect threshold (${drills.three_cone}s)`);
      thresholdPenalty += 5;
    }
    if (drills.bench_reps !== null && drills.bench_reps >= 28) {
      strengths.push(`Interior anchor strength (${drills.bench_reps} bench reps)`);
    }
  }

  const finalFitScore = Math.max(25, Math.min(99, Math.round((score / (totalWeights || 1)) - thresholdPenalty)));

  // Tier Classification
  let tier: SchemeFitResult['tier'] = 'SCHEME_MISFIT';
  if (finalFitScore >= 85) tier = 'ELITE_FIT';
  else if (finalFitScore >= 75) tier = 'STRONG_FIT';
  else if (finalFitScore >= 65) tier = 'ROLE_SPECIFIC';

  // Primary Driver & Scouting Diagnosis Synthesis
  let primary_driver = 'Balanced Athletic Baseline';
  let scouting_diagnosis = '';

  if (scheme.id === 'shanahan_outside_zone') {
    if (kin.kin_score && kin.kin_score >= 15.0) {
      primary_driver = 'Elite Deceleration Brake Radius';
      scouting_diagnosis = `Ideal system fit. 2-step braking profile allows immediate stem separation on 12-15yd in-breakers, optimizing Kyle Shanahan timing-based route trees.`;
    } else {
      primary_driver = 'Rounding Deceleration Footwork';
      scouting_diagnosis = `Scheme mismatch. Requires 4-5 rounding strides to stop, smothering timing windows and failing outside zone stem cut requirements.`;
    }
  } else if (scheme.id === 'schwartz_wide9_attack') {
    if (kin.kin_score && kin.kin_score >= 120.0) {
      primary_driver = 'Extreme Apex Arc Bend';
      scouting_diagnosis = `Plug-and-play Wide-9 edge rusher. High centripetal cornering acceleration allows tight arc dip under offensive tackle punches without washing out.`;
    } else {
      primary_driver = 'Stiff Cornering Hip Axis';
      scouting_diagnosis = `High risk in Wide-9 front. Upfield speed washes past pocket depth due to insufficient ankle tilt and centripetal bend load.`;
    }
  } else if (scheme.id === 'fangio_quarters_match') {
    if (kin.kin_score && kin.kin_score >= 14.0) {
      primary_driver = 'Low-Latency Hip Transition';
      scouting_diagnosis = `Flawless zone-match cornerback. Flips hips with minimal phase delay (τ < 0.15s), allowing clean pass-off and break-on-ball triggers in Cover 3/4.`;
    } else {
      primary_driver = 'Transition Phase Latency';
      scouting_diagnosis = `Vulnerable in Quarters match. Delayed hip turn gives away inside leverage on deep post-corner stems.`;
    }
  } else if (scheme.id === 'power_gap_trench') {
    if (kin.kin_score && kin.kin_score >= 12.0) {
      primary_driver = 'First-Step Mass Impulse';
      scouting_diagnosis = `Physical trench mauler. Generates instantaneous kinetic knockback within 0.5s of snap, resetting the line of scrimmage in power-gap concepts.`;
    } else {
      primary_driver = 'Late Velocity Buildup';
      scouting_diagnosis = `Lacks immediate pad collision force. Builds velocity late rather than delivering instant line displacement.`;
    }
  } else {
    primary_driver = strengths[0] || 'Physical Testing Baseline';
    scouting_diagnosis = `Solid operational fit for ${scheme.name}. Demonstrates balanced kinematic baseline across positional drills.`;
  }

  return {
    prospect,
    fit_score: finalFitScore,
    tier,
    primary_driver,
    strengths: strengths.slice(0, 3),
    concerns: concerns.slice(0, 2),
    scouting_diagnosis
  };
}
