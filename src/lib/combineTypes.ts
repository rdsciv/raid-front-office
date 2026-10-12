export interface ProspectMeasurement {
  height_inches: number | null;
  height_formatted: string;
  weight_lbs: number | null;
  arm_length: number | null;
  hand_size: number | null;
  wing_span: number | null;
}

export interface ProspectDrills {
  forty: number | null;
  pct_forty: number | null;
  ten_yd_split: number | null;
  pct_ten_split: number | null;
  short_shuttle: number | null;
  pct_shuttle: number | null;
  three_cone: number | null;
  pct_three_cone: number | null;
  vertical: number | null;
  pct_vertical: number | null;
  broad_jump: number | null;
  pct_broad: number | null;
  bench_reps: number | null;
  pct_bench: number | null;
}

export interface KinematicIntel {
  archetype: string;
  kin_metric_name: string;
  kin_score: number | null;
  target_metric_name: string;
  target_value: number | null;
  classification: string;
}

export interface AthleteComp {
  name: string;
  draft_year: number;
  college: string;
  pick: number;
  similarity_pct: number;
  forty: number | null;
  athletic_score: number;
}

export interface CareerStats {
  games_started: number;
  games_active: number;
  pro_bowl: number;
  all_pro: number;
}

export interface CombineProspect {
  nfl_id: number;
  name: string;
  position: string;
  combine_position: string;
  draft_year: number;
  draft_round: number | null;
  draft_pick: number | null;
  college: string;
  conference: string;
  measurements: ProspectMeasurement;
  drills: ProspectDrills;
  athletic_score: number;
  kinematics: KinematicIntel;
  similar_comps: AthleteComp[];
  career: CareerStats;
}
