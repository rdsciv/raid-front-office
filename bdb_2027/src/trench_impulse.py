"""
Archetype 4: Interior Trench Linemen & Running Backs (First-Step Impulse & LOS Displacement)
Decomposes the initial 0.5-second drive phase (0 to 1.5 yards) of the 40-yd dash / stance starts
to quantify explosive impulse and predict NFL line-of-scrimmage knock-back and yards before contact.
"""

import numpy as np
import pandas as pd
from kinematics import compute_kinematics, smooth_trajectory


def extract_trench_impulse_metrics(x, y, dt=0.1):
    """
    Analyzes the initial explosion off the line (first 0.5s - 1.0s).
    Extracts 0.5s impulse, jerk onset, and immediate displacement.
    """
    x_smooth, y_smooth = smooth_trajectory(x, y)
    kin = compute_kinematics(x_smooth, y_smooth, dt=dt)
    
    speed = kin["speed"]
    a_t = kin["a_tangential"]
    j_t = kin["jerk_tangential"]
    
    # Locate movement onset (frame where speed first exceeds 0.5 yd/s)
    onset_candidates = np.where(speed > 0.5)[0]
    onset_idx = onset_candidates[0] if len(onset_candidates) > 0 else 0
    
    # 0.5s window corresponds to 5 frames at 10 Hz
    w_05 = min(len(a_t), onset_idx + 5)
    accel_05 = a_t[onset_idx:w_05]
    
    # 0.5s Impulse: Integrated acceleration J = sum(a_t * dt)
    impulse_05 = float(np.sum(accel_05) * dt) if len(accel_05) > 0 else 2.5
    
    # Peak jerk onset during first 0.4s
    w_04 = min(len(j_t), onset_idx + 4)
    peak_jerk = float(np.max(j_t[onset_idx:w_04])) if len(j_t[onset_idx:w_04]) > 0 else 15.0
    
    # Displacement at t = 0.5s (yards traveled from onset)
    dx = x_smooth[w_05 - 1] - x_smooth[onset_idx]
    dy = y_smooth[w_05 - 1] - y_smooth[onset_idx]
    displacement_05 = float(np.sqrt(dx**2 + dy**2))
    
    # Trench Explosiveness Index (TEI):
    # Combines impulse with rapid jerk onset and immediate displacement
    tei = float((impulse_05 * displacement_05 * np.log1p(max(0, peak_jerk))))
    
    return {
        "impulse_0_5s": float(impulse_05),               # yd/s (e.g. 2.0 to 4.5)
        "first_step_jerk": float(peak_jerk),             # yd/s^3 (e.g. 12.0 to 35.0)
        "displacement_at_0_5s": float(displacement_05),  # yards (e.g. 0.8 to 1.6 yds)
        "trench_explosiveness_index": float(tei)         # Scaled index
    }
