#!/usr/bin/env python3
"""
Front-Office Scouting Screener & Decision Support Tool
Part of the NFL Big Data Bowl 2027 UKTE Suite.

Allows evaluators, scouts, and position coaches to query draft prospects,
isolate hidden sleepers, avoid bust traps, and inspect biomechanical prescriptions.
Supports both empirical real NFL draft data (2023-2025) and synthetic calibration cohorts.
"""

import os
import sys
import json
import argparse
import pandas as pd
import numpy as np

# Ensure local imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
from pipeline import (
    generate_wr_cohort,
    generate_edge_cohort,
    generate_cb_cohort,
    generate_trench_cohort
)


def load_synthetic_cohorts():
    """Ingests and computes classifications across all 4 synthetic cohorts."""
    cohorts = {
        "wr": {
            "name": "Wide Receivers & Tight Ends",
            "df": generate_wr_cohort(),
            "trad": "shuttle_time",
            "trad_label": "Shuttle (s)",
            "kin": "decel_efficiency_index",
            "kin_label": "DEI",
            "target": "nfl_stem_separation",
            "target_label": "Separation (yd)",
            "unit": "yd"
        },
        "edge": {
            "name": "EDGE Rushers & Defensive Linemen",
            "df": generate_edge_cohort(),
            "trad": "three_cone_time",
            "trad_label": "3-Cone (s)",
            "kin": "effective_bend_index",
            "kin_label": "EBI",
            "target": "nfl_prwr_arc",
            "target_label": "PRWR (%)",
            "unit": "%"
        },
        "cb": {
            "name": "Defensive Backs (CB & Safety)",
            "df": generate_cb_cohort(),
            "trad": "forty_yard_dash",
            "trad_label": "40-yd (s)",
            "kin": "db_fluidity_index",
            "kin_label": "FI",
            "target": "nfl_target_epa_allowed",
            "target_label": "Target EPA",
            "unit": ""
        },
        "trench": {
            "name": "Interior Trench & Running Backs",
            "df": generate_trench_cohort(),
            "trad": "ten_yard_split",
            "trad_label": "10-yd Split (s)",
            "kin": "trench_explosiveness_index",
            "kin_label": "TEI",
            "target": "nfl_los_knockback",
            "target_label": "Knockback (yd)",
            "unit": "yd"
        }
    }

    # Add quadrant labels
    for key, c in cohorts.items():
        df = c["df"]
        z_trad = -(df[c["trad"]] - df[c["trad"]].mean()) / df[c["trad"]].std()
        z_kin = (df[c["kin"]] - df[c["kin"]].mean()) / df[c["kin"]].std()
        df["z_trad"] = z_trad
        df["z_kin"] = z_kin

        conditions = [
            (z_trad < 0.0) & (z_kin > 0.5),   # Sleeper
            (z_trad > 0.5) & (z_kin < 0.0),   # Bust Trap
            (z_trad >= 0.0) & (z_kin >= 0.0), # Elite Consensus
        ]
        choices = ["💎 HIDDEN SLEEPER", "🚨 BUST TRAP", "⭐ ELITE CONSENSUS"]
        df["classification"] = np.select(conditions, choices, default="📋 DEPTH / BACKUP")

    return cohorts


# Backward compatibility alias
load_all_cohorts = load_synthetic_cohorts


def load_empirical_cohorts():
    """Loads empirical prospects extracted from official competition data."""
    intel_path = os.path.join(os.path.dirname(__file__), "outputs", "empirical_draft_intelligence.json")
    if not os.path.exists(intel_path):
        return None

    with open(intel_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    meta_labels = {
        "wr": {"name": "Wide Receivers & Tight Ends", "trad_label": "Shuttle (s)", "kin_label": "DEI", "target_label": "Separation", "unit": "yd"},
        "edge": {"name": "EDGE Rushers & Defensive Linemen", "trad_label": "3-Cone (s)", "kin_label": "EBI", "target_label": "Disruption Rate", "unit": "%"},
        "cb": {"name": "Defensive Backs (CB & Safety)", "trad_label": "40-yd (s)", "kin_label": "FI", "target_label": "Defensive EPA", "unit": ""},
        "trench": {"name": "Interior Trench & Running Backs", "trad_label": "10-yd (s)", "kin_label": "TEI", "target_label": "Leverage", "unit": "yd"}
    }

    cohorts = {}
    for code, players in raw.items():
        meta = meta_labels[code]
        df = pd.DataFrame(players)
        df["player_name"] = df["name"]
        df["draft_pick"] = df["pick"]
        cohorts[code] = {
            "name": meta["name"],
            "df": df,
            "trad": "trad",
            "trad_label": meta["trad_label"],
            "kin": "kin",
            "kin_label": meta["kin_label"],
            "target": "target",
            "target_label": meta["target_label"],
            "unit": meta["unit"]
        }
    return cohorts


def print_screener(cohort_key, quadrant="all", limit=10, mode="auto"):
    cohorts = None
    data_source_str = "Empirical (Official Kaggle NFL Data)"
    if mode in ["empirical", "auto"]:
        cohorts = load_empirical_cohorts()
    if cohorts is None or mode == "synthetic":
        cohorts = load_synthetic_cohorts()
        data_source_str = "Synthetic (Physics Calibration Cohort)"

    target_keys = [cohort_key] if cohort_key != "all" else ["wr", "edge", "cb", "trench"]

    print("=" * 98)
    print(f"🏈 NFL BIG DATA BOWL 2027: FRONT-OFFICE DECISION SUPPORT SCREENER")
    print(f"   Data Mode: {data_source_str}")
    print("=" * 98)

    for k in target_keys:
        c = cohorts[k]
        df = c["df"]

        if quadrant == "sleeper":
            filtered = df[df["classification"].str.contains("SLEEPER")]
        elif quadrant == "bust":
            filtered = df[df["classification"].str.contains("BUST")]
        elif quadrant == "elite":
            filtered = df[df["classification"].str.contains("ELITE")]
        else:
            filtered = df

        filtered = filtered.head(limit)

        print(f"\n📊 Position Archetype: {c['name']} (Showing top {len(filtered)})")
        print("-" * 98)
        print(f"{'Player Name':<24} {'Pick':<7} {c['trad_label']:<12} {c['kin_label']:<10} {c['target_label']:<18} {'Classification':<20}")
        print("-" * 98)

        for _, row in filtered.iterrows():
            target_str = f"{row[c['target']]:.2f}{c['unit']}"
            print(f"{row['player_name']:<24} #{int(row['draft_pick']):<6} {row[c['trad']]:<12.2f} {row[c['kin']]:<10.1f} {target_str:<18} {row['classification']:<20}")

    print("\n" + "=" * 98)


def main():
    parser = argparse.ArgumentParser(description="NFL Big Data Bowl 2027 Front-Office Scouting Screener")
    parser.add_argument("--archetype", choices=["all", "wr", "edge", "cb", "trench"], default="all",
                        help="Filter by positional archetype (default: all)")
    parser.add_argument("--quadrant", choices=["all", "sleeper", "bust", "elite"], default="all",
                        help="Filter by decision quadrant (default: all)")
    parser.add_argument("--mode", choices=["auto", "empirical", "synthetic"], default="auto",
                        help="Data source mode (auto / empirical / synthetic)")
    parser.add_argument("--limit", type=int, default=5,
                        help="Max prospects to display per archetype (default: 5)")
    args = parser.parse_args()

    print_screener(args.archetype, args.quadrant, args.limit, args.mode)


if __name__ == "__main__":
    main()
