#!/usr/bin/env python3
"""
Compiles the comprehensive NFL Combine & 10 Hz Kinematic Scout dataset
for the production web application (public/data/combine_scout_data.json).
Includes:
- Official combine measurements & drill percentiles
- 10 Hz UKTE kinematic indices (DEI, EBI, FI, TEI)
- Four-quadrant scouting classifications (Sleeper, Bust, Elite, Depth)
- Nearest-neighbor Similar Athlete Comps engine
"""

import os
import json
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "bdb_2027", "data")
OUTPUT_FILE = os.path.join(BASE_DIR, "public", "data", "combine_scout_data.json")

# Ensure output directory exists
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

df_players = pd.read_csv(os.path.join(DATA_DIR, "players.csv"))
df_comb_res = pd.read_csv(os.path.join(DATA_DIR, "combine_results.csv"))
df_career = pd.read_csv(os.path.join(DATA_DIR, "player_career_successes.csv"))

# Load empirical kinematic intelligence
intel_path = os.path.join(BASE_DIR, "bdb_2027", "outputs", "empirical_draft_intelligence.json")
with open(intel_path, "r", encoding="utf-8") as f:
    intel = json.load(f)

# Flatten intelligence lookup
kin_lookup = {}
for code, players in intel.items():
    for p in players:
        kin_lookup[p["nfl_id"]] = {
            "archetype": code,
            "kin_metric_name": "DEI" if code == "wr" else ("EBI" if code == "edge" else ("FI" if code == "cb" else "TEI")),
            "kin_score": p["kin"],
            "target_metric_name": "Stem Separation" if code == "wr" else ("Disruption Rate" if code == "edge" else ("Defensive EPA" if code == "cb" else "LOS Leverage")),
            "target_value": p["target"],
            "classification": p["classification"]
        }

# Merge metadata
df = df_players.merge(df_comb_res, on=["nfl_id", "draft_year"], how="left")
df = df.merge(df_career, on="nfl_id", how="left")

# Helper for formatted height
def format_height(inches):
    if pd.isna(inches) or inches <= 0:
        return "N/A"
    ft = int(inches // 12)
    rem = int(round(inches % 12))
    return f"{ft}' {rem}\""

# Calculate percentiles for drills
def calc_percentile(series, inverted=False):
    valid = series.dropna()
    if valid.empty:
        return pd.Series(50.0, index=series.index)
    if inverted:
        # Lower is better (e.g., 40 yard dash)
        return series.apply(lambda x: 100.0 - (stats_percentile(valid, x)) if pd.notna(x) else None)
    else:
        return series.apply(lambda x: stats_percentile(valid, x) if pd.notna(x) else None)

def stats_percentile(valid_series, val):
    return float(np.mean(valid_series <= val) * 100.0)

df["pct_forty"] = calc_percentile(df["forty"], inverted=True)
df["pct_ten_split"] = calc_percentile(df["ten_yd_split"], inverted=True)
df["pct_shuttle"] = calc_percentile(df["short_shuttle"], inverted=True)
df["pct_three_cone"] = calc_percentile(df["three_cone"], inverted=True)
df["pct_vertical"] = calc_percentile(df["vertical"], inverted=False)
df["pct_broad"] = calc_percentile(df["broad_jump"], inverted=False)
df["pct_bench"] = calc_percentile(df["bench_reps"], inverted=False)

# Composite Athleticism Score (0-100)
drill_pct_cols = ["pct_forty", "pct_ten_split", "pct_shuttle", "pct_three_cone", "pct_vertical", "pct_broad"]
df["composite_athletic_score"] = df[drill_pct_cols].mean(axis=1, skipna=True).round(1)
df["composite_athletic_score"] = df["composite_athletic_score"].fillna(df["ngs_athleticism_score"].fillna(65.0))

# Nearest-neighbor Similar Athletes Comps Engine
comp_features = ["combine_height", "combine_weight", "forty", "vertical", "broad_jump", "short_shuttle", "three_cone"]
norm_df = df[comp_features].copy()
# Fill missing with median
for c in comp_features:
    norm_df[c] = (norm_df[c] - norm_df[c].mean()) / (norm_df[c].std() + 1e-6)
norm_df = norm_df.fillna(0.0)
norm_matrix = norm_df.values

all_records = []
n_players = len(df)

for i, row in df.iterrows():
    nfl_id = int(row["nfl_id"])
    pos = str(row["nfl_position"])
    
    # Calculate similarities with all other players
    diffs = norm_matrix - norm_matrix[i]
    dists = np.linalg.norm(diffs, axis=1)
    
    # Filter for same general position group if possible
    same_pos_mask = (df["nfl_position"] == pos).values
    same_pos_mask[i] = False
    
    candidate_indices = np.where(same_pos_mask)[0]
    if len(candidate_indices) < 3:
        # Fallback to all players
        any_mask = np.ones(n_players, dtype=bool)
        any_mask[i] = False
        candidate_indices = np.where(any_mask)[0]
        
    sorted_candidates = candidate_indices[np.argsort(dists[candidate_indices])[:3]]
    
    comps = []
    for c_idx in sorted_candidates:
        c_row = df.iloc[c_idx]
        d_val = dists[c_idx]
        sim_pct = max(70.0, min(99.0, 100.0 - (d_val * 7.5)))
        comps.append({
            "name": str(c_row["display_name"]),
            "draft_year": int(c_row["draft_year"]),
            "college": str(c_row.get("college_name", "N/A")),
            "pick": int(c_row.get("draft_overall_pick", 150)) if pd.notna(c_row.get("draft_overall_pick")) else 150,
            "similarity_pct": round(float(sim_pct), 1),
            "forty": round(float(c_row["forty"]), 2) if pd.notna(c_row["forty"]) else None,
            "athletic_score": round(float(c_row["composite_athletic_score"]), 1)
        })

    # Kinematic Intel
    k_data = kin_lookup.get(nfl_id, {
        "archetype": "general",
        "kin_metric_name": "Kinematic Index",
        "kin_score": None,
        "target_metric_name": "In-Game Impact",
        "target_value": None,
        "classification": "📋 DEPTH / BACKUP"
    })

    record = {
        "nfl_id": nfl_id,
        "name": str(row["display_name"]),
        "position": pos,
        "combine_position": str(row.get("combine_position", pos)),
        "draft_year": int(row["draft_year"]),
        "draft_round": int(row["draft_round"]) if pd.notna(row["draft_round"]) else None,
        "draft_pick": int(row["draft_overall_pick"]) if pd.notna(row["draft_overall_pick"]) else None,
        "college": str(row.get("college_name", "Unknown")),
        "conference": str(row.get("college_conference", "Other")),
        "measurements": {
            "height_inches": float(row["combine_height"]) if pd.notna(row["combine_height"]) else None,
            "height_formatted": format_height(row["combine_height"]),
            "weight_lbs": int(row["combine_weight"]) if pd.notna(row["combine_weight"]) else None,
            "arm_length": float(row["arm_length"]) if pd.notna(row["arm_length"]) else None,
            "hand_size": float(row["hand_size"]) if pd.notna(row["hand_size"]) else None,
            "wing_span": float(row["wing_span"]) if pd.notna(row["wing_span"]) else None
        },
        "drills": {
            "forty": round(float(row["forty"]), 2) if pd.notna(row["forty"]) else None,
            "pct_forty": round(float(row["pct_forty"]), 1) if pd.notna(row["pct_forty"]) else None,
            "ten_yd_split": round(float(row["ten_yd_split"]), 2) if pd.notna(row["ten_yd_split"]) else None,
            "pct_ten_split": round(float(row["pct_ten_split"]), 1) if pd.notna(row["pct_ten_split"]) else None,
            "short_shuttle": round(float(row["short_shuttle"]), 2) if pd.notna(row["short_shuttle"]) else None,
            "pct_shuttle": round(float(row["pct_shuttle"]), 1) if pd.notna(row["pct_shuttle"]) else None,
            "three_cone": round(float(row["three_cone"]), 2) if pd.notna(row["three_cone"]) else None,
            "pct_three_cone": round(float(row["pct_three_cone"]), 1) if pd.notna(row["pct_three_cone"]) else None,
            "vertical": float(row["vertical"]) if pd.notna(row["vertical"]) else None,
            "pct_vertical": round(float(row["pct_vertical"]), 1) if pd.notna(row["pct_vertical"]) else None,
            "broad_jump": int(row["broad_jump"]) if pd.notna(row["broad_jump"]) else None,
            "pct_broad": round(float(row["pct_broad"]), 1) if pd.notna(row["pct_broad"]) else None,
            "bench_reps": int(row["bench_reps"]) if pd.notna(row["bench_reps"]) else None,
            "pct_bench": round(float(row["pct_bench"]), 1) if pd.notna(row["pct_bench"]) else None
        },
        "athletic_score": round(float(row["composite_athletic_score"]), 1),
        "kinematics": k_data,
        "similar_comps": comps,
        "career": {
            "games_started": int(row["career_games_started"]) if pd.notna(row["career_games_started"]) else 0,
            "games_active": int(row["career_games_active"]) if pd.notna(row["career_games_active"]) else 0,
            "pro_bowl": int(row["pro_bowl_original_ballot"]) if pd.notna(row["pro_bowl_original_ballot"]) else 0,
            "all_pro": int(row["ap_all_pro_1st_team"]) if pd.notna(row["ap_all_pro_1st_team"]) else 0
        }
    }
    all_records.append(record)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(all_records, f, indent=2)

print(f"Successfully compiled {len(all_records)} prospects into: {OUTPUT_FILE}")
