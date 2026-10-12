"""
NFL Big Data Bowl 2027 - Figure 4 Generator: Empirical Spatiotemporal Trajectory Case Study
Compares high-fidelity 10 Hz coordinate tracks and kinematic derivative curves
between elite separators / bend athletes and drifting / bust-risk prospects.
"""

import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe

def generate_trajectory_figure():
    tracking_path = "bdb_2027/data/combine_tracking.csv"
    players_path = "bdb_2027/data/players.csv"
    output_dir = "bdb_2027/outputs"
    os.makedirs(output_dir, exist_ok=True)
    
    # Configure Matplotlib high-contrast dark theme
    plt.style.use('dark_background')
    plt.rcParams.update({
        'font.family': 'sans-serif',
        'font.sans-serif': ['Helvetica', 'DejaVu Sans', 'Arial'],
        'font.size': 10,
        'axes.titlesize': 11,
        'axes.labelsize': 10,
        'xtick.labelsize': 9,
        'ytick.labelsize': 9,
        'figure.facecolor': '#0B0F19',
        'axes.facecolor': '#111827',
        'axes.edgecolor': '#374151',
        'axes.grid': True,
        'grid.color': '#1F2937',
        'grid.linestyle': '--',
        'grid.alpha': 0.6,
    })

    print("[Step 1/3] Loading Combine 10 Hz tracking dataset...")
    df_track = pd.read_csv(tracking_path)
    df_players = pd.read_csv(players_path)

    # 1. Extract Short Shuttle for Jayden Reed (55915) & Isaac TeSlaa (58275)
    reed_shuttle = df_track[(df_track['nfl_id'] == 55915) & (df_track['drill_name'] == 'SHORT_SHUTTLE')].sort_values('time')
    # Filter attempt 1 or 2
    if 2 in reed_shuttle['attempt'].values:
        reed_shuttle = reed_shuttle[reed_shuttle['attempt'] == 2]
    else:
        reed_shuttle = reed_shuttle[reed_shuttle['attempt'] == 1]

    teslaa_shuttle = df_track[(df_track['nfl_id'] == 58275) & (df_track['drill_name'] == 'SHORT_SHUTTLE')].sort_values('time')
    teslaa_shuttle = teslaa_shuttle[teslaa_shuttle['attempt'] == 1]

    # Normalize X-Y coordinates relative to initial plant point
    reed_x = reed_shuttle['x'].values - reed_shuttle['x'].values[0]
    reed_y = reed_shuttle['y'].values - reed_shuttle['y'].values[0]
    reed_s = reed_shuttle['s'].values
    reed_a = reed_shuttle['a'].values
    reed_t = np.arange(len(reed_x)) * 0.1

    teslaa_x = teslaa_shuttle['x'].values - teslaa_shuttle['x'].values[0]
    teslaa_y = teslaa_shuttle['y'].values - teslaa_shuttle['y'].values[0]
    teslaa_s = teslaa_shuttle['s'].values
    teslaa_a = teslaa_shuttle['a'].values
    teslaa_t = np.arange(len(teslaa_x)) * 0.1

    # 2. Extract 3-Cone for Isaiah Foskey (55905, High Bend) & Lukas Van Ness (55877, Bust Trap Bend)
    foskey_cone = df_track[(df_track['nfl_id'] == 55905) & (df_track['drill_name'] == 'THREE_CONE_DRILL')].sort_values('time')
    foskey_cone = foskey_cone[foskey_cone['attempt'] == foskey_cone['attempt'].values[0]]

    vanness_cone = df_track[(df_track['nfl_id'] == 55877) & (df_track['drill_name'] == 'THREE_CONE_DRILL')].sort_values('time')
    vanness_cone = vanness_cone[vanness_cone['attempt'] == vanness_cone['attempt'].values[0]]

    foskey_x = foskey_cone['x'].values - foskey_cone['x'].values[0]
    foskey_y = foskey_cone['y'].values - foskey_cone['y'].values[0]
    foskey_s = foskey_cone['s'].values
    foskey_t = np.arange(len(foskey_x)) * 0.1

    vanness_x = vanness_cone['x'].values - vanness_cone['x'].values[0]
    vanness_y = vanness_cone['y'].values - vanness_cone['y'].values[0]
    vanness_s = vanness_cone['s'].values
    vanness_t = np.arange(len(vanness_x)) * 0.1

    # Compute Curvature and Centripetal Acceleration for 3-cone apex
    def compute_curv_an(x, y, s):
        dx = np.gradient(x, 0.1)
        dy = np.gradient(y, 0.1)
        ddx = np.gradient(dx, 0.1)
        ddy = np.gradient(dy, 0.1)
        kappa = np.abs(dx * ddy - dy * ddx) / ((dx**2 + dy**2)**1.5 + 1e-5)
        an = (s**2) * kappa
        return kappa, an

    foskey_kappa, foskey_an = compute_curv_an(foskey_x, foskey_y, foskey_s)
    vanness_kappa, vanness_an = compute_curv_an(vanness_x, vanness_y, vanness_s)

    print("[Step 2/3] Plotting 4-panel empirical trajectory case study...")
    fig, axes = plt.subplots(2, 2, figsize=(15, 12), dpi=300)
    fig.patch.set_facecolor('#0B0F19')

    # Color constants
    CYAN = '#38BDF8'      # Jayden Reed (Sleeper)
    ROSE = '#F43F5E'      # Isaac TeSlaa (Bust)
    EMERALD = '#34D399'   # Isaiah Foskey (Elite Bend)
    AMBER = '#F59E0B'     # Lukas Van Ness (Linear Speed)

    # ---------------- PANEL A: Shuttle Spatiotemporal Trajectory ----------------
    ax_a = axes[0, 0]
    ax_a.plot(reed_x, reed_y, color=CYAN, linewidth=2.5, label='Jayden Reed (Sleeper: Compact Turn, DEI=15.0)', zorder=4)
    ax_a.scatter(reed_x[::5], reed_y[::5], color=CYAN, s=25, alpha=0.8, zorder=5)
    
    ax_a.plot(teslaa_x, teslaa_y, color=ROSE, linewidth=2.2, linestyle='--', label='Isaac TeSlaa (Bust Trap: Drift Turn, DEI=1.0)', zorder=3)
    ax_a.scatter(teslaa_x[::5], teslaa_y[::5], color=ROSE, s=25, alpha=0.8, zorder=4)

    # Mark Plant Turn Boundaries (5yd and 10yd marks)
    ax_a.axvline(x=5.0, color='#6B7280', linestyle=':', label='5-Yard Reversal Boundary')
    ax_a.axvline(x=-5.0, color='#6B7280', linestyle=':', label='10-Yard Reversal Boundary')
    ax_a.set_title('A. 20-Yard Shuttle: 10 Hz Spatiotemporal Plant Trajectory', fontweight='bold', pad=12)
    ax_a.set_xlabel('Lateral Displacement (yards)')
    ax_a.set_ylabel('Forward Displacement (yards)')
    ax_a.legend(loc='lower left', frameon=True, facecolor='#1F2937', edgecolor='#374151', fontsize=8.5)

    # Annotation highlight inside the plot area
    ax_a.annotate('Reed Sharp Plant Radius:\n2.1 yd compact braking arc', 
                  xy=(3.1, -0.05), 
                  xytext=(0.2, -0.32),
                  arrowprops=dict(arrowstyle="->", color=CYAN, lw=1.5),
                  color=CYAN, fontsize=8.5, fontweight='bold',
                  bbox=dict(boxstyle="round,pad=0.3", fc="#1E293B", ec=CYAN, lw=1, alpha=0.9))

    # ---------------- PANEL B: Deceleration Velocity & Braking Impulse ----------------
    ax_b = axes[0, 1]
    ax_b.plot(reed_t, reed_s, color=CYAN, linewidth=2.5, label='Reed Speed v(t) [m/s]')
    ax_b.plot(teslaa_t, teslaa_s, color=ROSE, linewidth=2.2, linestyle='--', label='TeSlaa Speed v(t) [m/s]')
    
    # Plot Acceleration on twin axis
    ax_b_twin = ax_b.twinx()
    ax_b_twin.plot(reed_t, reed_a, color='#60A5FA', linewidth=1.5, alpha=0.5, label='Reed Accel a(t) [m/s²]')
    ax_b_twin.plot(teslaa_t, teslaa_a, color='#FB7185', linewidth=1.5, alpha=0.5, linestyle=':', label='TeSlaa Accel a(t) [m/s²]')
    ax_b_twin.set_ylabel('Instantaneous Acceleration (m/s²)', color='#9CA3AF')
    ax_b_twin.tick_params(colors='#9CA3AF')
    ax_b_twin.grid(False)

    ax_b.set_title('B. Deceleration Dynamics & Plant Latency (v and a vs. Time)', fontweight='bold', pad=12)
    ax_b.set_xlabel('Elapsed Time (seconds)')
    ax_b.set_ylabel('Speed (m/s)')
    ax_b.legend(loc='upper right', frameon=True, facecolor='#1F2937', edgecolor='#374151', fontsize=8.5)

    # ---------------- PANEL C: EDGE 3-Cone Apex Turn Trajectory ----------------
    ax_c = axes[1, 0]
    ax_c.plot(foskey_x, foskey_y, color=EMERALD, linewidth=2.5, label='Isaiah Foskey (Elite Bend: EBI=240.3)', zorder=4)
    ax_c.scatter(foskey_x[::4], foskey_y[::4], color=EMERALD, s=25, alpha=0.8, zorder=5)

    ax_c.plot(vanness_x, vanness_y, color=AMBER, linewidth=2.2, linestyle='--', label='Lukas Van Ness (Linear Speed / Wide Apex: EBI=106.0)', zorder=3)
    ax_c.scatter(vanness_x[::4], vanness_y[::4], color=AMBER, s=25, alpha=0.8, zorder=4)

    # Marker for Cone 3 Apex
    ax_c.scatter([0], [10], color='#FFFFFF', marker='^', s=120, label='Cone 3 (Apex Turn)', zorder=6)
    ax_c.set_title('C. 3-Cone Drill: Apex Turn Path & Hip-Dip Arc Mechanics', fontweight='bold', pad=12)
    ax_c.set_xlabel('Lateral Displacement (yards)')
    ax_c.set_ylabel('Longitudinal Path (yards)')
    ax_c.legend(loc='lower right', frameon=True, facecolor='#1F2937', edgecolor='#374151', fontsize=8.5)

    # ---------------- PANEL D: Apex Centripetal Acceleration (Bend Load) ----------------
    ax_d = axes[1, 1]
    # Restrict to middle 50% where apex turn occurs
    mid_f = len(foskey_t) // 2
    f_win = slice(max(0, mid_f - 15), min(len(foskey_t), mid_f + 15))
    mid_v = len(vanness_t) // 2
    v_win = slice(max(0, mid_v - 15), min(len(vanness_t), mid_v + 15))

    ax_d.plot(foskey_t[f_win] - foskey_t[f_win][0], foskey_an[f_win], color=EMERALD, linewidth=2.5, 
              label=f'Foskey Centripetal Load (Peak {np.max(foskey_an[f_win]):.1f} m/s²)')
    ax_d.plot(vanness_t[v_win] - vanness_t[v_win][0], vanness_an[v_win], color=AMBER, linewidth=2.2, linestyle='--',
              label=f'Van Ness Centripetal Load (Peak {np.max(vanness_an[v_win]):.1f} m/s²)')

    ax_d.set_title('D. Apex Centripetal Load $a_n = v^2 \\kappa$ (Cornering Force Capacity)', fontweight='bold', pad=12)
    ax_d.set_xlabel('Turn Phase Duration (seconds)')
    ax_d.set_ylabel('Centripetal Acceleration $a_n$ (m/s²)')
    ax_d.legend(loc='upper right', frameon=True, facecolor='#1F2937', edgecolor='#374151', fontsize=8.5)

    plt.suptitle('Figure 4: Empirical Spatiotemporal Case Studies from 10 Hz Combine Sensor Telemetry\nDecoupling Straight-Line Testing Stopwatch Speed from Continuous On-Field Vector Mechanics',
                 fontsize=13, fontweight='black', color='#F9FAFB', y=0.98)
    plt.tight_layout(rect=[0, 0.02, 1, 0.95])

    out_file = os.path.join(output_dir, "figure4_kinematic_trajectory_case_study.png")
    fig.savefig(out_file, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"[Step 3/3] Figure 4 successfully generated and saved to {out_file} (Size: {os.path.getsize(out_file) / 1024:.1f} KB)")

if __name__ == "__main__":
    generate_trajectory_figure()
