"""
Empirical Master Pipeline: NFL Big Data Bowl 2027.
Extracts 10 Hz micro-kinematics directly from the official Kaggle competition dataset:
- combine_tracking.csv
- combine_results.csv
- players.csv
- player_play.csv
- player_career_successes.csv

Computes empirical DEI, EBI, FI, and TEI for real NFL prospects (2023-2025 Draft classes),
links to empirical regular-season in-game performance, fits nested OLS models, and renders
empirical figures and scouting intelligence.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import statsmodels.api as sm
from scipy import stats

sys.path.insert(0, os.path.dirname(__file__))
from kinematics import compute_kinematics, smooth_trajectory
from wr_deceleration import extract_wr_deceleration_metrics
from edge_bend import extract_edge_bend_metrics
from cb_fluidity import extract_cb_fluidity_metrics
from trench_impulse import extract_trench_impulse_metrics
from translation_models import evaluate_archetype_translation


def load_raw_competition_data(data_dir=None):
    """Loads all official CSV files from the local data cache."""
    if data_dir is None:
        data_dir = os.path.join(os.path.dirname(__file__), "..", "data")

    print(f"Loading official competition data from: {data_dir}")
    df_players = pd.read_csv(os.path.join(data_dir, "players.csv"))
    df_comb_res = pd.read_csv(os.path.join(data_dir, "combine_results.csv"))
    df_career = pd.read_csv(os.path.join(data_dir, "player_career_successes.csv"))
    df_comb_track = pd.read_csv(os.path.join(data_dir, "combine_tracking.csv"))
    df_player_play = pd.read_csv(os.path.join(data_dir, "player_play.csv"))

    # Player metadata
    players_meta = df_players.merge(df_comb_res, on=["nfl_id", "draft_year"], how="left")
    players_meta = players_meta.merge(df_career, on="nfl_id", how="left")

    return {
        "players_meta": players_meta,
        "comb_track": df_comb_track,
        "player_play": df_player_play
    }


def compute_empirical_in_game_metrics(df_player_play):
    """Aggregates regular-season Next Gen Stats metrics per player."""
    print("Aggregating regular-season in-game metrics from player_play.csv...")

    agg_funcs = {
        "play_id": "count",
        "expected_points_added": "mean",
        "separation_at_pass_forward": "mean",
        "time_to_pressure": "mean",
        "pressure_allowed": lambda x: np.mean(x == True) if len(x) > 0 else np.nan,
        "player_get_off": "mean",
        "sack": "sum",
        "tackle": "sum"
    }

    in_game = df_player_play.groupby("nfl_id").agg(agg_funcs).reset_index()
    in_game.columns = [
        "nfl_id", "total_plays", "in_game_mean_epa", "in_game_mean_separation",
        "in_game_time_to_pressure", "in_game_pressure_allowed_rate",
        "in_game_mean_get_off", "in_game_total_sacks", "in_game_total_tackles"
    ]
    return in_game


def extract_empirical_archetypes(data):
    """Extracts 10 Hz kinematic indices for each player in their respective drill."""
    players_meta = data["players_meta"]
    comb_track = data["comb_track"]
    in_game = compute_empirical_in_game_metrics(data["player_play"])

    full_df = players_meta.merge(in_game, on="nfl_id", how="left")

    # Filter to PLAYER entity type
    comb_track = comb_track[comb_track["entity_type"] == "PLAYER"]

    # 1. WR / TE: SHORT_SHUTTLE -> DEI
    print("\nExtracting empirical WR/TE Deceleration Efficiency Index (DEI)...")
    shuttle_track = comb_track[comb_track["drill_name"] == "SHORT_SHUTTLE"]
    wr_records = []
    for nfl_id, g in shuttle_track.groupby("nfl_id"):
        g = g.sort_values("time")
        if len(g) >= 12:
            res = extract_wr_deceleration_metrics(g["x"].values, g["y"].values)
            res["nfl_id"] = nfl_id
            wr_records.append(res)
    df_wr_kin = pd.DataFrame(wr_records)

    wr_merged = full_df[full_df["nfl_position"].isin(["WR", "TE", "SLOT_WR"])].merge(df_wr_kin, on="nfl_id", how="inner")
    # Clean targets and predictors
    wr_merged["shuttle_time"] = wr_merged["short_shuttle"].fillna(wr_merged["shuttle_time"] if "shuttle_time" in wr_merged else 4.25)
    wr_merged["shuttle_time"] = wr_merged["shuttle_time"].fillna(4.25)
    wr_merged["draft_pick"] = wr_merged["draft_overall_pick"].fillna(150).astype(int)
    wr_merged["target_sep"] = wr_merged["in_game_mean_separation"].fillna(wr_merged["in_game_mean_separation"].median() if not wr_merged["in_game_mean_separation"].dropna().empty else 2.65)
    wr_merged["decel_efficiency_index"] = np.clip(wr_merged["decel_efficiency_index"], 1.0, 35.0)

    # 2. EDGE / DL: THREE_CONE_DRILL -> EBI
    print("Extracting empirical EDGE/DL Effective Bend Index (EBI)...")
    cone_track = comb_track[comb_track["drill_name"] == "THREE_CONE_DRILL"]
    edge_records = []
    for nfl_id, g in cone_track.groupby("nfl_id"):
        g = g.sort_values("time")
        if len(g) >= 15:
            dir_angles = g["dir"].values if "dir" in g else None
            res = extract_edge_bend_metrics(g["x"].values, g["y"].values, orientations=dir_angles)
            res["nfl_id"] = nfl_id
            edge_records.append(res)
    df_edge_kin = pd.DataFrame(edge_records)

    edge_merged = full_df[full_df["nfl_position"].isin(["DE", "OLB", "DT", "EDGE"])].merge(df_edge_kin, on="nfl_id", how="inner")
    edge_merged["three_cone_time"] = edge_merged["three_cone"].fillna(7.15)
    edge_merged["draft_pick"] = edge_merged["draft_overall_pick"].fillna(120).astype(int)
    # Pass rush effectiveness: sack rate per 100 plays or negative EPA generated
    edge_merged["prwr_proxy"] = (edge_merged["in_game_total_sacks"] / np.maximum(edge_merged["total_plays"], 10)) * 100.0
    edge_merged["effective_bend_index"] = np.clip(edge_merged["effective_bend_index"], 20.0, 450.0)

    # 3. CB / DB: BACK_PEDAL / W_DRILL -> FI
    print("Extracting empirical CB/DB Hip Fluidity Index (FI)...")
    db_track = comb_track[comb_track["drill_name"].isin(["BACK_PEDAL_AND_TRANSITION_45_DEGREE_REACTION", "W_DRILL"])]
    db_records = []
    for nfl_id, g in db_track.groupby("nfl_id"):
        g = g.sort_values("time")
        if len(g) >= 12:
            dir_angles = g["dir"].values if "dir" in g else None
            res = extract_cb_fluidity_metrics(g["x"].values, g["y"].values, orientations=dir_angles)
            res["nfl_id"] = nfl_id
            db_records.append(res)
    df_db_kin = pd.DataFrame(db_records).drop_duplicates(subset=["nfl_id"])

    cb_merged = full_df[full_df["nfl_position"].isin(["CB", "SS", "FS", "DB"])].merge(df_db_kin, on="nfl_id", how="inner")
    cb_merged["forty_time"] = cb_merged["forty"].fillna(4.45)
    cb_merged["draft_pick"] = cb_merged["draft_overall_pick"].fillna(110).astype(int)
    cb_merged["target_epa"] = cb_merged["in_game_mean_epa"].fillna(0.0)
    cb_merged["db_fluidity_index"] = np.clip(cb_merged["db_fluidity_index"], 2.0, 80.0)

    # 4. Trench / RB: FORTY_YARD_DASH (first 0.5s) -> TEI
    print("Extracting empirical Trench First-Step Impulse (TEI)...")
    forty_track = comb_track[comb_track["drill_name"] == "FORTY_YARD_DASH"]
    trench_records = []
    for nfl_id, g in forty_track.groupby("nfl_id"):
        g = g.sort_values("time")
        if len(g) >= 10:
            res = extract_trench_impulse_metrics(g["x"].values, g["y"].values)
            res["nfl_id"] = nfl_id
            trench_records.append(res)
    df_trench_kin = pd.DataFrame(trench_records).drop_duplicates(subset=["nfl_id"])

    trench_merged = full_df[full_df["nfl_position"].isin(["G", "T", "C", "DT", "NT", "RB", "FB"])].merge(df_trench_kin, on="nfl_id", how="inner")
    trench_merged["ten_split"] = trench_merged["ten_yd_split"].fillna(1.68)
    trench_merged["draft_pick"] = trench_merged["draft_overall_pick"].fillna(130).astype(int)
    # Target: inverse pressure allowed rate or positive EPA
    trench_merged["knockback_proxy"] = (1.0 - trench_merged["in_game_pressure_allowed_rate"].fillna(0.05)) * 2.5
    trench_merged["trench_explosiveness_index"] = np.clip(trench_merged["trench_explosiveness_index"], 0.5, 12.0)

    return {
        "wr": wr_merged,
        "edge": edge_merged,
        "cb": cb_merged,
        "trench": trench_merged
    }


def run_empirical_pipeline():
    """Runs end-to-end empirical modeling on real competition data."""
    print("=" * 80)
    print("NFL BIG DATA BOWL 2027: EMPIRICAL TRANSLATION PIPELINE (REAL DATA)")
    print("=" * 80)

    data = load_raw_competition_data()
    cohorts = extract_empirical_archetypes(data)
    output_dir = os.path.join(os.path.dirname(__file__), "..", "outputs")
    os.makedirs(output_dir, exist_ok=True)

    arch_configs = [
        {
            "name": "Wide Receivers & Tight Ends",
            "code": "wr",
            "df": cohorts["wr"],
            "trad": "shuttle_time",
            "trad_label": "Short Shuttle (s)",
            "kin": "decel_efficiency_index",
            "kin_label": "DEI (Decel Efficiency)",
            "target": "target_sep",
            "target_label": "Mean Separation at Target (yd)"
        },
        {
            "name": "EDGE Rushers & Defensive Linemen",
            "code": "edge",
            "df": cohorts["edge"],
            "trad": "three_cone_time",
            "trad_label": "3-Cone Drill (s)",
            "kin": "effective_bend_index",
            "kin_label": "EBI (Effective Bend)",
            "target": "prwr_proxy",
            "target_label": "Pass Rush Sack/Disruption Rate (%)"
        },
        {
            "name": "Defensive Backs (CB & Safety)",
            "code": "cb",
            "df": cohorts["cb"],
            "trad": "forty_time",
            "trad_label": "40-yd Dash (s)",
            "kin": "db_fluidity_index",
            "kin_label": "FI (Hip Fluidity)",
            "target": "target_epa",
            "target_label": "Defensive EPA per Play"
        },
        {
            "name": "Interior Trench & Running Backs",
            "code": "trench",
            "df": cohorts["trench"],
            "trad": "ten_split",
            "trad_label": "10-yd Split (s)",
            "kin": "trench_explosiveness_index",
            "kin_label": "TEI (Trench Impulse)",
            "target": "knockback_proxy",
            "target_label": "Line Leverage / Protection (yd)"
        }
    ]

    summary_rows = []
    print("\n--- Empirical Statistical Model Results ---")
    for cfg in arch_configs:
        df = cfg["df"]
        print(f"\nArchetype: {cfg['name']} (Sample size: N = {len(df)} real prospects)")
        eval_res = evaluate_archetype_translation(
            df=df,
            target_col=cfg["target"],
            trad_col=cfg["trad"],
            kin_col=cfg["kin"],
            draft_col="draft_pick"
        )
        print(f"  > Baseline Model (Stopwatch + Draft Pick): R^2 = {eval_res['r2_base']:.3f}, AIC = {eval_res['aic_base']:.1f}")
        print(f"  > Enhanced Model (+ 10 Hz Kinematics):    R^2 = {eval_res['r2_enh']:.3f}, AIC = {eval_res['aic_enh']:.1f}")
        print(f"  > Incremental Delta R^2:                  +{eval_res['delta_r2']:.3f}")
        print(f"  > Likelihood Ratio Test:                  Chi2 = {eval_res['lrt_stat']:.2f}, p-val = {eval_res['lrt_pvalue']:.2e}")

        summary_rows.append({
            "Archetype": cfg["name"],
            "Sample Size N": len(df),
            "Conventional Drill": cfg["trad_label"],
            "10Hz Kinematic Metric": cfg["kin_label"],
            "NFL Target Metric": cfg["target_label"],
            "Base R2": round(eval_res["r2_base"], 3),
            "Enhanced R2": round(eval_res["r2_enh"], 3),
            "Delta R2": f"+{eval_res['delta_r2']:.3f}",
            "Delta AIC": f"{eval_res['delta_aic']:.1f}",
            "LRT p-value": f"{eval_res['lrt_pvalue']:.2e}"
        })

    summary_df = pd.DataFrame(summary_rows)
    summary_path = os.path.join(output_dir, "empirical_statistical_benchmarks.csv")
    summary_df.to_csv(summary_path, index=False)
    print(f"\nEmpirical benchmarks exported to: {summary_path}")

    # Export empirical prospect decision matrix
    empirical_scouting = {}
    for cfg in arch_configs:
        df = cfg["df"].copy()
        # Compute z-scores
        z_trad = -(df[cfg["trad"]] - df[cfg["trad"]].mean()) / np.maximum(df[cfg["trad"]].std(), 1e-4)
        z_kin = (df[cfg["kin"]] - df[cfg["kin"]].mean()) / np.maximum(df[cfg["kin"]].std(), 1e-4)
        df["z_trad"] = z_trad
        df["z_kin"] = z_kin

        conditions = [
            (z_trad < 0.0) & (z_kin > 0.4),
            (z_trad > 0.4) & (z_kin < 0.0),
            (z_trad >= 0.0) & (z_kin >= 0.0),
        ]
        choices = ["💎 HIDDEN SLEEPER", "🚨 BUST TRAP", "⭐ ELITE CONSENSUS"]
        df["classification"] = np.select(conditions, choices, default="📋 DEPTH / BACKUP")

        records = []
        for _, r in df.sort_values(by="z_kin", ascending=False).iterrows():
            records.append({
                "nfl_id": int(r["nfl_id"]),
                "name": str(r.get("display_name", f"Player {r['nfl_id']}")),
                "college": str(r.get("college_name", "N/A")),
                "draft_year": int(r.get("draft_year", 2024)),
                "pick": int(r["draft_pick"]),
                "trad": round(float(r[cfg["trad"]]), 2),
                "kin": round(float(r[cfg["kin"]]), 1),
                "target": round(float(r[cfg["target"]]), 2),
                "classification": str(r["classification"])
            })
        empirical_scouting[cfg["code"]] = records

    intel_path = os.path.join(output_dir, "empirical_draft_intelligence.json")
    with open(intel_path, "w", encoding="utf-8") as f:
        json.dump(empirical_scouting, f, indent=2)
    print(f"Empirical scouting intelligence saved to: {intel_path}")
    print("=" * 80)


if __name__ == "__main__":
    run_empirical_pipeline()
