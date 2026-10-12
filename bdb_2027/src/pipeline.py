"""
Master Analytical Pipeline: Big Data Bowl 2027 - Combine to NFL Performance.
Loops through all four positional archetypes:
1. Wide Receivers & Tight Ends (Deceleration-to-Separation Engine)
2. EDGE Rushers & Defensive Linemen (Apex Curvature & Centripetal Bend)
3. Defensive Backs (Hip Fluidity & Transition Latency)
4. Interior Trench Linemen & Running Backs (First-Step Impulse & LOS Displacement)

Computes 10 Hz micro-kinematics, fits statistical translation models, benchmarks
against stopwatch metrics, identifies draft market inefficiencies, and exports
publication-ready charts and reports.
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec

# Ensure local imports work cleanly
import sys
sys.path.insert(0, os.path.dirname(__file__))

from kinematics import compute_kinematics, smooth_trajectory
from wr_deceleration import extract_wr_deceleration_metrics
from edge_bend import extract_edge_bend_metrics
from cb_fluidity import extract_cb_fluidity_metrics
from trench_impulse import extract_trench_impulse_metrics
from translation_models import evaluate_archetype_translation


def set_plot_style():
    """Applies modern clean typography and athletic aesthetics."""
    plt.rcParams["font.sans-serif"] = ["Helvetica", "Arial", "DejaVu Sans"]
    plt.rcParams["axes.edgecolor"] = "#2d3748"
    plt.rcParams["axes.linewidth"] = 0.8
    plt.rcParams["grid.color"] = "#e2e8f0"
    plt.rcParams["grid.linestyle"] = "--"
    plt.rcParams["grid.alpha"] = 0.6


def generate_wr_cohort(n=60, seed=42):
    """Generates synthetic WR cohort with 10 Hz Combine shuttle tracking and NFL in-game outcomes."""
    rng = np.random.default_rng(seed)
    players = []
    
    names = [
        "Amon-Ra Miller", "Jaxon Higgins", "Marvin Coleman", "Devonte Reed", "Rome Mitchell",
        "Malik Worthy", "Keon Nabers", "Adonai Odunze", "Brian Thomas Jr.", "Ladd McConkey",
        "Xavier Worthy", "Ricky Pearsall", "Ja'Lynn Polk", "Troy Franklin", "Jermaine Burton",
        "Roman Wilson", "Jalen McMillan", "Luke McCaffrey", "Johnny Wilson", "Ainias Smith"
    ] + [f"WR Prospect {i}" for i in range(21, n + 1)]
    
    for i in range(n):
        name = names[i]
        draft_pick = int(rng.integers(5, 220))
        # Conventional shuttle time (seconds)
        shuttle_time = float(np.clip(rng.normal(4.22, 0.12), 3.95, 4.55))
        
        # 10 Hz synthetic shuttle trajectory (5-10-5 drill: 0 -> 5 -> -5 -> 5)
        # Total duration ~ shuttle_time; 10 frames/sec
        t_arr = np.linspace(0, shuttle_time, int(shuttle_time * 10))
        
        # True latent hip-sink deceleration trait (independent of pure straight-line speed)
        latent_brake_trait = float(rng.normal(0, 1))
        
        # Kinematic deceleration profile
        decel_rate = -7.5 + (latent_brake_trait * 1.8) - ((shuttle_time - 4.22) * 4.0)
        decel_jerk = -18.0 + (latent_brake_trait * 5.5)
        exit_accel = 4.2 + (latent_brake_trait * 0.8) - ((shuttle_time - 4.22) * 2.0)
        
        # Generate representative trajectory coordinates
        # 1st leg: 0 to 5 yards, plant at 5, return to 0 and -5, plant, return to 0
        x = np.piecewise(t_arr, 
                         [t_arr < shuttle_time*0.25, 
                          (t_arr >= shuttle_time*0.25) & (t_arr < shuttle_time*0.75), 
                          t_arr >= shuttle_time*0.75],
                         [lambda t: (5.0 / (shuttle_time*0.25)) * t,
                          lambda t: 5.0 - (10.0 / (shuttle_time*0.50)) * (t - shuttle_time*0.25),
                          lambda t: -5.0 + (5.0 / (shuttle_time*0.25)) * (t - shuttle_time*0.75)])
        y = rng.normal(0, 0.05, len(x))
        
        # Extract 10 Hz metrics
        kin_metrics = extract_wr_deceleration_metrics(x, y)
        # Inject latent variation
        kin_metrics["peak_braking_decel"] = decel_rate
        kin_metrics["peak_decel_jerk"] = decel_jerk
        kin_metrics["exit_accel_peak"] = exit_accel
        kin_metrics["decel_efficiency_index"] = (np.abs(decel_rate) * np.abs(decel_jerk) * exit_accel) / (kin_metrics["braking_duration"] * 100.0)
        
        # In-game NFL target: Separation at stem break point on hard-cut routes (yards)
        # Governed heavily by DEI (+), weakly by shuttle time (-), and draft pick (-)
        noise = rng.normal(0, 0.20)
        stem_separation = 2.40 + (0.55 * (kin_metrics["decel_efficiency_index"] - 3.5) / 1.5) - (0.35 * (shuttle_time - 4.22) / 0.12) - (0.25 * (draft_pick - 100) / 70.0) + noise
        stem_separation = float(np.clip(stem_separation, 1.1, 4.2))
        
        # Hard-cut route win rate (%)
        win_rate = float(np.clip(45.0 + (stem_separation - 2.4) * 16.0 + rng.normal(0, 3.0), 20.0, 85.0))
        
        players.append({
            "player_name": name,
            "position": "WR",
            "draft_pick": draft_pick,
            "shuttle_time": shuttle_time,
            "peak_braking_decel": kin_metrics["peak_braking_decel"],
            "peak_decel_jerk": kin_metrics["peak_decel_jerk"],
            "braking_duration": kin_metrics["braking_duration"],
            "exit_accel_peak": kin_metrics["exit_accel_peak"],
            "decel_efficiency_index": kin_metrics["decel_efficiency_index"],
            "nfl_stem_separation": stem_separation,
            "nfl_route_win_rate": win_rate
        })
        
    return pd.DataFrame(players)


def generate_edge_cohort(n=60, seed=43):
    """Generates synthetic EDGE/DL cohort with 3-cone apex cornering and NFL pass-rush win rate."""
    rng = np.random.default_rng(seed)
    players = []
    
    names = [
        "Dallas Turner", "Laiatu Latu", "Jared Verse", "Chop Robinson", "Darius Robinson",
        "Chris Braswell", "Jonah Elliss", "Marshawn Kneeland", "Adisa Isaac", "Bralen Trice",
        "Austin Booker", "Mohamed Kamara", "Jalyx Hunt", "Javon Solomon", "Cedric Johnson",
        "Gabriel Murphy", "Myles Murphy", "Will Anderson Jr.", "Aidan Hutchinson", "George Karlaftis"
    ] + [f"EDGE Prospect {i}" for i in range(21, n + 1)]
    
    for i in range(n):
        name = names[i]
        draft_pick = int(rng.integers(5, 220))
        cone_time = float(np.clip(rng.normal(7.12, 0.18), 6.75, 7.60))
        
        # Latent ankle flexion and pelvic tilt capability
        latent_bend = float(rng.normal(0, 1))
        
        # Kinematics around apex cone
        apex_curv = float(np.clip(0.72 + (latent_bend * 0.15) - ((cone_time - 7.12) * 0.4), 0.35, 1.25))
        centripetal_an = float(np.clip(8.5 + (latent_bend * 1.8) - ((cone_time - 7.12) * 3.5), 4.5, 13.0))
        v_retention = float(np.clip(0.82 + (latent_bend * 0.08) - ((cone_time - 7.12) * 0.2), 0.58, 0.96))
        slip_angle = float(np.clip(18.0 - (latent_bend * 5.0) + ((cone_time - 7.12) * 12.0), 6.0, 40.0))
        
        # Effective Bend Index
        ebi = (centripetal_an * v_retention * apex_curv * 10.0) / (1.0 + (slip_angle / 45.0))
        
        # NFL In-Game Pass Rush Win Rate (%) vs OT arc
        noise = rng.normal(0, 2.2)
        prwr = 14.5 + (4.8 * (ebi - 50.0) / 15.0) - (2.2 * (cone_time - 7.12) / 0.18) - (2.5 * (draft_pick - 100) / 70.0) + noise
        prwr = float(np.clip(prwr, 4.0, 28.5))
        
        # Sub-2.5s pressure rate (%)
        sub_25_pressure = float(np.clip(prwr * 0.55 + rng.normal(0, 1.2), 2.0, 17.5))
        
        players.append({
            "player_name": name,
            "position": "EDGE",
            "draft_pick": draft_pick,
            "three_cone_time": cone_time,
            "apex_curvature": apex_curv,
            "apex_centripetal_accel": centripetal_an,
            "velocity_retention_ratio": v_retention,
            "slip_angle_mean": slip_angle,
            "effective_bend_index": ebi,
            "nfl_prwr_arc": prwr,
            "nfl_sub25_pressure_rate": sub_25_pressure
        })
        
    return pd.DataFrame(players)


def generate_cb_cohort(n=60, seed=44):
    """Generates synthetic CB/DB cohort with backpedal-to-sprint transition and NFL target EPA allowed."""
    rng = np.random.default_rng(seed)
    players = []
    
    names = [
        "Quinyon Mitchell", "Terrion Arnold", "Nate Wiggins", "Kool-Aid McKinstry", "Cooper DeJean",
        "Ennis Rakestraw Jr.", "Max Melton", "Mike Sainristil", "Renardo Green", "Kamari Lassiter",
        "Jarrian Jones", "Andru Phillips", "Chau Smith-Wade", "Decamerion Richardson", "Caelen Carson",
        "Josh Newton", "Kris Abrams-Draine", "Christian Gonzalez", "Devon Witherspoon", "Sauce Gardner"
    ] + [f"DB Prospect {i}" for i in range(21, n + 1)]
    
    for i in range(n):
        name = names[i]
        draft_pick = int(rng.integers(5, 220))
        forty_time = float(np.clip(rng.normal(4.44, 0.08), 4.28, 4.65))
        
        # Latent hip fluidity trait
        latent_fluidity = float(rng.normal(0, 1))
        
        # Transition latency (seconds): lower is better
        trans_latency = float(np.clip(0.24 - (latent_fluidity * 0.05) + ((forty_time - 4.44) * 0.3), 0.11, 0.42))
        ke_retention = float(np.clip(0.76 + (latent_fluidity * 0.10) - ((forty_time - 4.44) * 0.4), 0.48, 0.98))
        recov_accel = float(np.clip(4.8 + (latent_fluidity * 0.7) - ((forty_time - 4.44) * 2.5), 2.8, 6.8))
        
        fluidity_index = (recov_accel * ke_retention) / (trans_latency + 0.05)
        
        # NFL In-Game Target EPA Allowed: lower is better (-0.25 is elite shutdown, +0.35 is burnt)
        noise = rng.normal(0, 0.08)
        target_epa = 0.02 - (0.16 * (fluidity_index - 13.0) / 4.5) + (0.06 * (forty_time - 4.44) / 0.08) + (0.07 * (draft_pick - 100) / 70.0) + noise
        target_epa = float(np.clip(target_epa, -0.32, 0.45))
        
        # NFL Separation Allowed at Break (yards)
        sep_allowed = float(np.clip(2.65 - (0.45 * (fluidity_index - 13.0) / 4.5) + (0.18 * (forty_time - 4.44) / 0.08) + rng.normal(0, 0.15), 1.3, 4.1))
        
        players.append({
            "player_name": name,
            "position": "CB",
            "draft_pick": draft_pick,
            "forty_yard_dash": forty_time,
            "hip_transition_latency": trans_latency,
            "ke_retention_ratio": ke_retention,
            "recovery_accel": recov_accel,
            "db_fluidity_index": fluidity_index,
            "nfl_target_epa_allowed": target_epa,
            "nfl_separation_allowed": sep_allowed
        })
        
    return pd.DataFrame(players)


def generate_trench_cohort(n=60, seed=45):
    """Generates synthetic Trench/RB cohort with 0.5s impulse and NFL LOS knockback / YBC."""
    rng = np.random.default_rng(seed)
    players = []
    
    names = [
        "Joe Alt", "JC Latham", "Olu Fashanu", "Taliese Fuaga", "Amarius Mims",
        "Troy Fautanu", "Jordan Morgan", "Graham Barton", "Jackson Powers-Johnson", "Tyler Guyton",
        "Jonathon Brooks", "Trey Benson", "Blake Corum", "MarShawn Lloyd", "Bucky Irving",
        "Ray Davis", "Audric Estime", "Braelon Allen", "Bijan Robinson", "Jalen Carter"
    ] + [f"Trench Prospect {i}" for i in range(21, n + 1)]
    
    for i in range(n):
        name = names[i]
        draft_pick = int(rng.integers(5, 220))
        ten_yard_split = float(np.clip(rng.normal(1.68, 0.07), 1.52, 1.86))
        
        # Latent first-step explosive drive trait
        latent_drive = float(rng.normal(0, 1))
        
        impulse_05 = float(np.clip(3.1 + (latent_drive * 0.55) - ((ten_yard_split - 1.68) * 3.5), 1.8, 4.6))
        first_step_jerk = float(np.clip(22.0 + (latent_drive * 4.5) - ((ten_yard_split - 1.68) * 25.0), 10.0, 36.0))
        disp_05 = float(np.clip(1.18 + (latent_drive * 0.18) - ((ten_yard_split - 1.68) * 1.2), 0.75, 1.65))
        
        tei = impulse_05 * disp_05 * np.log1p(first_step_jerk)
        
        # NFL In-Game Metric: Line of Scrimmage Displacement / Knockback created (yards)
        noise = rng.normal(0, 0.22)
        los_knockback = 1.65 + (0.48 * (tei - 11.5) / 3.0) - (0.22 * (ten_yard_split - 1.68) / 0.07) - (0.24 * (draft_pick - 100) / 70.0) + noise
        los_knockback = float(np.clip(los_knockback, 0.4, 3.2))
        
        # Yards before contact created
        ybc = float(np.clip(los_knockback * 0.95 + rng.normal(0, 0.18), 0.8, 3.4))
        
        players.append({
            "player_name": name,
            "position": "OL_DL_RB",
            "draft_pick": draft_pick,
            "ten_yard_split": ten_yard_split,
            "impulse_0_5s": impulse_05,
            "first_step_jerk": first_step_jerk,
            "displacement_at_0_5s": disp_05,
            "trench_explosiveness_index": tei,
            "nfl_los_knockback": los_knockback,
            "nfl_yards_before_contact": ybc
        })
        
    return pd.DataFrame(players)


def run_pipeline():
    """Runs the complete analytical framework looping across all four archetypes."""
    print("=" * 80)
    print("NFL BIG DATA BOWL 2027: UNIFIED KINEMATIC TRANSLATION ENGINE (UKTE)")
    print("Theme: Combine 10 Hz Sensor Tracking to NFL Regular Season Performance")
    print("=" * 80)
    
    set_plot_style()
    output_dir = os.path.join(os.path.dirname(__file__), "..", "outputs")
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Generate cohorts
    print("\n[Step 1/5] Ingesting & Generating 10 Hz Cohort Tracking Data...")
    df_wr = generate_wr_cohort()
    df_edge = generate_edge_cohort()
    df_cb = generate_cb_cohort()
    df_trench = generate_trench_cohort()
    
    # 2. Loop through all 4 archetypes and evaluate statistical models
    print("\n[Step 2/5] Looping Through All Four Positional Archetypes & Estimating Models...")
    
    archetypes = [
        {
            "name": "Wide Receivers & Tight Ends",
            "code": "WR_TE",
            "df": df_wr,
            "target": "nfl_stem_separation",
            "target_label": "NFL Stem Break Separation (yd)",
            "trad": "shuttle_time",
            "trad_label": "Combine 20-yd Shuttle Time (s)",
            "kin": "decel_efficiency_index",
            "kin_label": "Deceleration Efficiency Index (DEI)",
            "inverted_target": False
        },
        {
            "name": "EDGE Rushers & Defensive Linemen",
            "code": "EDGE_DL",
            "df": df_edge,
            "target": "nfl_prwr_arc",
            "target_label": "NFL Pass Rush Win Rate (%)",
            "trad": "three_cone_time",
            "trad_label": "Combine 3-Cone Time (s)",
            "kin": "effective_bend_index",
            "kin_label": "Effective Bend Index (EBI)",
            "inverted_target": False
        },
        {
            "name": "Defensive Backs (CB & Safety)",
            "code": "CB_DB",
            "df": df_cb,
            "target": "nfl_target_epa_allowed",
            "target_label": "NFL Target EPA Allowed",
            "trad": "forty_yard_dash",
            "trad_label": "Combine 40-yd Dash Time (s)",
            "kin": "db_fluidity_index",
            "kin_label": "Hip Fluidity Index (FI)",
            "inverted_target": True # Lower target EPA is better
        },
        {
            "name": "Interior Trench & Running Backs",
            "code": "TRENCH_RB",
            "df": df_trench,
            "target": "nfl_los_knockback",
            "target_label": "NFL LOS Knockback / Displacement (yd)",
            "trad": "ten_yard_split",
            "trad_label": "Combine 10-yd Split Time (s)",
            "kin": "trench_explosiveness_index",
            "kin_label": "Trench Explosiveness Index (TEI)",
            "inverted_target": False
        }
    ]
    
    results = {}
    summary_rows = []
    
    for arch in archetypes:
        print(f"\n--- Processing Archetype: {arch['name']} ---")
        eval_res = evaluate_archetype_translation(
            df=arch["df"],
            target_col=arch["target"],
            trad_col=arch["trad"],
            kin_col=arch["kin"],
            draft_col="draft_pick"
        )
        results[arch["code"]] = eval_res
        
        print(f"  > Baseline Model (Stopwatch + Draft Pick): R^2 = {eval_res['r2_base']:.3f}, AIC = {eval_res['aic_base']:.1f}")
        print(f"  > Enhanced Model (+ 10 Hz Kinematics):    R^2 = {eval_res['r2_enh']:.3f}, AIC = {eval_res['aic_enh']:.1f}")
        print(f"  > Incremental Delta R^2:                  +{eval_res['delta_r2']:.3f} ({eval_res['delta_r2']*100:.1f}% gain)")
        print(f"  > Likelihood Ratio Test:                  Chi2 = {eval_res['lrt_stat']:.2f}, p-value = {eval_res['lrt_pvalue']:.2e}")
        print(f"  > Kinematic Metric Coeff:                 beta = {eval_res['kin_coef']:.4f}, t = {eval_res['kin_tstat']:.2f}, p = {eval_res['kin_pval']:.2e}")
        
        summary_rows.append({
            "Archetype": arch["name"],
            "Conventional Drill": arch["trad_label"],
            "10Hz Kinematic Metric": arch["kin_label"],
            "NFL Target Metric": arch["target_label"],
            "Base R2": round(eval_res["r2_base"], 3),
            "Enhanced R2": round(eval_res["r2_enh"], 3),
            "Delta R2": f"+{eval_res['delta_r2']:.3f}",
            "Delta AIC": f"{eval_res['delta_aic']:.1f}",
            "LRT p-value": f"{eval_res['lrt_pvalue']:.2e}",
            "Kinematic Coeff p-val": f"{eval_res['kin_pval']:.2e}"
        })
        
    # Save CSV and JSON summary
    summary_df = pd.DataFrame(summary_rows)
    summary_df.to_csv(os.path.join(output_dir, "statistical_model_benchmarks.csv"), index=False)
    
    # 3. Generate Visuals
    print("\n[Step 3/5] Rendering High-Resolution Analytical Visuals...")
    
    # FIGURE 1: Model Incremental Explanatory Power (R^2 & Delta AIC)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5.5), facecolor="white")
    
    archetype_short_names = ["WR / TE", "EDGE / DL", "CB / DB", "Trench / RB"]
    x_pos = np.arange(len(archetype_short_names))
    width = 0.35
    
    r2_bases = [results[a["code"]]["r2_base"] for a in archetypes]
    r2_enhs = [results[a["code"]]["r2_enh"] for a in archetypes]
    delta_aics = [results[a["code"]]["delta_aic"] for a in archetypes]
    
    ax1.bar(x_pos - width/2, r2_bases, width, label="Baseline (Stopwatch + Draft Pick)", color="#94a3b8", edgecolor="#475569")
    ax1.bar(x_pos + width/2, r2_enhs, width, label="Enhanced (+ 10 Hz Kinematic Metric)", color="#2563eb", edgecolor="#1d4ed8")
    
    for i in range(len(x_pos)):
        delta = r2_enhs[i] - r2_bases[i]
        ax1.annotate(f"+{delta:.2f}\n(+{delta*100:.0f}%)", 
                     xy=(x_pos[i] + width/2, r2_enhs[i] + 0.02), 
                     ha="center", fontsize=9, fontweight="bold", color="#1d4ed8")
        
    ax1.set_ylabel("Variance Explained ($R^2$)", fontsize=11, fontweight="bold")
    ax1.set_title("Incremental Explanatory Power of 10 Hz Kinematics", fontsize=12, fontweight="bold")
    ax1.set_xticks(x_pos)
    ax1.set_xticklabels(archetype_short_names, fontsize=10, fontweight="bold")
    ax1.set_ylim(0, 1.0)
    ax1.legend(frameon=True, facecolor="#f8fafc", loc="upper left")
    ax1.grid(axis="y", linestyle="--", alpha=0.5)
    
    # Delta AIC Plot
    colors_aic = ["#059669" if d < -10 else "#d97706" for d in delta_aics]
    bars = ax2.bar(x_pos, delta_aics, width=0.5, color=colors_aic, edgecolor="#1f2937")
    ax2.axhline(-10, color="#dc2626", linestyle="--", linewidth=1.2, label=r"Decisive Threshold ($\Delta AIC \leq -10$)")
    
    for i, d in enumerate(delta_aics):
        ax2.annotate(f"{d:.1f}", xy=(x_pos[i], d - 3.5), ha="center", fontsize=10, fontweight="bold", color="#065f46")
        
    ax2.set_ylabel(r"Information Criterion Shift ($\Delta AIC$)", fontsize=11, fontweight="bold")
    ax2.set_title(r"Bayesian Information Improvement ($\Delta AIC = AIC_{enh} - AIC_{base}$)", fontsize=12, fontweight="bold")
    ax2.set_xticks(x_pos)
    ax2.set_xticklabels(archetype_short_names, fontsize=10, fontweight="bold")
    ax2.legend(frameon=True, facecolor="#f8fafc", loc="lower left")
    ax2.grid(axis="y", linestyle="--", alpha=0.5)
    
    plt.tight_layout()
    fig1_path = os.path.join(output_dir, "figure1_model_performance_comparison.png")
    fig.savefig(fig1_path, dpi=300)
    plt.close(fig)
    print(f"  > Saved: {fig1_path}")
    
    # FIGURE 2: Front Office Decision Matrix (Stopwatch vs Kinematics) for all 4 Archetypes
    fig, axes = plt.subplots(2, 2, figsize=(16, 14), facecolor="white")
    axes = axes.flatten()
    
    quadrant_colors = {
        "Verified Alpha (High Speed / High Mechanics)": "#16a34a",
        "Hidden Sleeper (Avg Stopwatch / Elite Mechanics)": "#2563eb",
        "Bust Risk Trap (Blistering Speed / Flawed Mechanics)": "#dc2626",
        "Low Ceiling / Sub-replacement": "#94a3b8"
    }
    
    for idx, arch in enumerate(archetypes):
        ax = axes[idx]
        eval_df = results[arch["code"]]["evaluated_df"]
        
        # Scatter plot colored by scouting classification
        for cls_name, color in quadrant_colors.items():
            subset = eval_df[eval_df["scouting_classification"] == cls_name]
            ax.scatter(subset["trad_zscore"], subset["kin_zscore"], c=color, label=cls_name, s=75, alpha=0.85, edgecolors="#1f2937", linewidth=0.5)
            
        ax.axhline(0, color="#64748b", linestyle="--", linewidth=1.0)
        ax.axvline(0, color="#64748b", linestyle="--", linewidth=1.0)
        
        # Annotate top Sleeper and Bust prospects
        sleepers = eval_df[eval_df["scouting_classification"] == "Hidden Sleeper (Avg Stopwatch / Elite Mechanics)"].sort_values("kin_zscore", ascending=False)
        busts = eval_df[eval_df["scouting_classification"] == "Bust Risk Trap (Blistering Speed / Flawed Mechanics)"].sort_values("trad_zscore", ascending=False)
        
        if len(sleepers) > 0:
            top_s = sleepers.iloc[0]
            ax.annotate(f"SLEEPER: {top_s.name if hasattr(top_s, 'name') and isinstance(top_s.name, str) else 'Hidden Gem'}\nPick #{top_s['draft_pick']}",
                        xy=(top_s["trad_zscore"], top_s["kin_zscore"]),
                        xytext=(top_s["trad_zscore"] - 1.2, top_s["kin_zscore"] + 0.3),
                        arrowprops=dict(facecolor="#2563eb", arrowstyle="->", lw=1.5),
                        fontsize=8.5, fontweight="bold", color="#1e40af",
                        bbox=dict(boxstyle="round,pad=0.2", facecolor="#eff6ff", edgecolor="#93c5fd"))
            
        if len(busts) > 0:
            top_b = busts.iloc[0]
            ax.annotate(f"BUST RISK: {top_b.name if hasattr(top_b, 'name') and isinstance(top_b.name, str) else 'Speed Trap'}\nPick #{top_b['draft_pick']}",
                        xy=(top_b["trad_zscore"], top_b["kin_zscore"]),
                        xytext=(top_b["trad_zscore"] - 1.3, top_b["kin_zscore"] - 0.7),
                        arrowprops=dict(facecolor="#dc2626", arrowstyle="->", lw=1.5),
                        fontsize=8.5, fontweight="bold", color="#991b1b",
                        bbox=dict(boxstyle="round,pad=0.2", facecolor="#fef2f2", edgecolor="#fca5a5"))
            
        ax.set_title(f"{arch['name']}: Evaluator Decision Matrix", fontsize=12, fontweight="bold")
        ax.set_xlabel(f"Stopwatch Z-Score ({arch['trad_label'].split('(')[0].strip()})", fontsize=10)
        ax.set_ylabel(f"10 Hz Kinematic Z-Score ({arch['kin_label'].split('(')[0].strip()})", fontsize=10)
        ax.grid(True, linestyle=":", alpha=0.6)
        if idx == 0:
            ax.legend(frameon=True, facecolor="#f8fafc", loc="lower left", fontsize=8)
            
    plt.tight_layout()
    fig2_path = os.path.join(output_dir, "figure2_evaluator_decision_matrix.png")
    fig.savefig(fig2_path, dpi=300)
    plt.close(fig)
    print(f"  > Saved: {fig2_path}")
    
    # FIGURE 3: Kinematic Translation Curves into Regular Season Performance
    fig, axes = plt.subplots(2, 2, figsize=(15, 12), facecolor="white")
    axes = axes.flatten()
    
    for idx, arch in enumerate(archetypes):
        ax = axes[idx]
        eval_df = results[arch["code"]]["evaluated_df"]
        
        # Plot Scatter
        scatter = ax.scatter(eval_df[arch["kin"]], eval_df["actual_target"], 
                             c=eval_df["draft_pick"], cmap="viridis_r", s=70, alpha=0.85, edgecolors="#334155")
        
        # Regression trend line
        kin_vals = np.linspace(eval_df[arch["kin"]].min(), eval_df[arch["kin"]].max(), 100)
        mean_trad = eval_df[arch["trad"]].mean()
        mean_draft = eval_df["draft_pick"].mean()
        
        res = results[arch["code"]]["res_enh"]
        pred_line = res.params["const"] + res.params[arch["trad"]] * mean_trad + res.params["draft_pick"] * mean_draft + res.params[arch["kin"]] * kin_vals
        
        ax.plot(kin_vals, pred_line, color="#dc2626", linewidth=2.5, 
                label=f"Kinematic Marginal Effect (t={res.tvalues[arch['kin']]:.2f}, p={res.pvalues[arch['kin']]:.1e})")
        
        ax.set_title(f"{arch['name']}: Combine 10 Hz Metric -> NFL Outcome", fontsize=11, fontweight="bold")
        ax.set_xlabel(arch["kin_label"], fontsize=10, fontweight="bold")
        ax.set_ylabel(arch["target_label"], fontsize=10, fontweight="bold")
        ax.legend(frameon=True, facecolor="#f8fafc", loc="upper left" if not arch["inverted_target"] else "lower left", fontsize=8.5)
        ax.grid(True, linestyle="--", alpha=0.5)
        
        cbar = plt.colorbar(scatter, ax=ax)
        cbar.set_label("NFL Draft Pick #", fontsize=8)
        
    plt.tight_layout()
    fig3_path = os.path.join(output_dir, "figure3_nfl_translation_relationships.png")
    fig.savefig(fig3_path, dpi=300)
    plt.close(fig)
    print(f"  > Saved: {fig3_path}")
    
    # 4. Generate Front-Office Scouting Sleepers & Bust Report
    print("\n[Step 4/5] Isolating Front-Office Market Inefficiencies & Drafting Sleepers...")
    inefficiency_report = []
    for arch in archetypes:
        eval_df = results[arch["code"]]["evaluated_df"]
        sleepers = eval_df[eval_df["scouting_classification"] == "Hidden Sleeper (Avg Stopwatch / Elite Mechanics)"]
        busts = eval_df[eval_df["scouting_classification"] == "Bust Risk Trap (Blistering Speed / Flawed Mechanics)"]
        
        inefficiency_report.append({
            "archetype": arch["name"],
            "total_evaluated": len(eval_df),
            "sleeper_count": len(sleepers),
            "bust_count": len(busts),
            "sleeper_top_picks": sleepers.sort_values("kin_zscore", ascending=False)[["draft_pick", arch["trad"], arch["kin"], "actual_target"]].head(3).to_dict(orient="records"),
            "bust_top_picks": busts.sort_values("trad_zscore", ascending=False)[["draft_pick", arch["trad"], arch["kin"], "actual_target"]].head(3).to_dict(orient="records")
        })
        
    with open(os.path.join(output_dir, "draft_inefficiency_intelligence.json"), "w") as f:
        json.dump(inefficiency_report, f, indent=2)
        
    print(f"\n[Step 5/5] Pipeline Run Complete! All tables, figures, and model benchmarks saved to {output_dir}")
    print("=" * 80)
    return results, summary_df


if __name__ == "__main__":
    run_pipeline()
