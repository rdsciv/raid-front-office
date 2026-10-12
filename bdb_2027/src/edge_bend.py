"""
Archetype 2: EDGE Rushers & Defensive Linemen (Quantifying "The Bend")
Decomposes 3-cone and agility drill cornering into apex curvature, centripetal acceleration,
and velocity retention to predict NFL edge pass-rush win rate (PRWR) and quick pressures.
"""

import numpy as np
import pandas as pd
from kinematics import compute_kinematics, smooth_trajectory


def extract_edge_bend_metrics(x, y, orientations=None, dt=0.1):
    """
    Analyzes the apex cornering phase of an agility drill (e.g. 3-cone loop around the apex cone).
    Computes curvature, centripetal acceleration, and velocity retention.
    """
    x_smooth, y_smooth = smooth_trajectory(x, y)
    kin = compute_kinematics(x_smooth, y_smooth, orientations, dt=dt)
    
    curvature = kin["curvature"]
    a_normal = kin["a_normal"]
    speed = kin["speed"]
    slip_angle = kin["slip_angle"]
    
    # Apex event: point of maximum curvature (the tightest turn around the cone)
    # Ignore initial and terminal frames to avoid edge artifacts
    trim = min(5, len(curvature) // 5)
    valid_range = slice(trim, len(curvature) - trim if len(curvature) > trim * 2 else len(curvature))
    
    apex_idx = np.argmax(curvature[valid_range]) + trim
    
    apex_curv = float(curvature[apex_idx])
    apex_an = float(a_normal[apex_idx])
    apex_speed = float(speed[apex_idx])
    
    # Measure entry velocity (0.5s before apex)
    entry_idx = max(0, apex_idx - 5)
    entry_speed = float(speed[entry_idx]) if speed[entry_idx] > 0.5 else max(1.0, float(np.mean(speed)))
    
    # Velocity retention ratio (how much linear speed is preserved during peak bend)
    v_retention = float(apex_speed / max(entry_speed, 1.0))
    
    # Turn window (± 3 frames around apex)
    w_start = max(0, apex_idx - 3)
    w_end = min(len(slip_angle), apex_idx + 4)
    mean_slip = float(np.mean(slip_angle[w_start:w_end])) if len(slip_angle) > 0 else 0.0
    
    # Effective Bend Index (EBI):
    # EBI = (apex_an * v_retention * apex_curv * 10) / (1 + mean_slip / 45.0)
    # High EBI reflects an edge rusher who generates huge centripetal force without losing speed
    # or drifting torso orientation outward.
    ebi = (apex_an * v_retention * apex_curv * 10.0) / (1.0 + (mean_slip / 45.0))
    
    return {
        "apex_curvature": apex_curv,                 # 1/yd (e.g. 0.4 to 1.1)
        "apex_centripetal_accel": apex_an,           # yd/s^2 (e.g. 5.0 to 11.5)
        "velocity_retention_ratio": v_retention,     # ratio (e.g. 0.65 to 0.92)
        "slip_angle_mean": mean_slip,                # degrees (e.g. 10 to 35 deg)
        "effective_bend_index": float(ebi)           # Scaled index
    }
