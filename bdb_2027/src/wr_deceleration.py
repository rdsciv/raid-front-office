"""
Archetype 1: Wide Receivers & Tight Ends (Deceleration-to-Separation Engine)
Extracts plant-and-cut braking kinematics from Combine shuttle/cone drills and links
them to NFL in-game route stem separation and hard-cut route win rate.
"""

import numpy as np
import pandas as pd
from kinematics import compute_kinematics, smooth_trajectory


def extract_wr_deceleration_metrics(x, y, orientations=None, dt=0.1):
    """
    Identifies hard-cut plant events (such as shuttle reversal or cone cuts)
    and computes micro-kinematic braking and exit efficiency metrics.
    """
    x_smooth, y_smooth = smooth_trajectory(x, y)
    kin = compute_kinematics(x_smooth, y_smooth, orientations, dt=dt)
    
    speed = kin["speed"]
    a_t = kin["a_tangential"]
    j_t = kin["jerk_tangential"]
    
    # Identify plant/cut point: minimum speed inflection during the drill
    # In a 5-10-5 shuttle, there are two primary reversal cuts.
    # We locate points where speed dips below 50% max and a_t crosses from negative to positive
    speed_threshold = np.max(speed) * 0.4
    minima_indices = []
    for i in range(1, len(speed) - 1):
        if speed[i] < speed[i - 1] and speed[i] < speed[i + 1] and speed[i] < speed_threshold:
            minima_indices.append(i)
            
    if not minima_indices:
        # Fallback to absolute minimum speed index away from boundaries
        minima_indices = [int(np.argmin(speed[5:-5]) + 5)] if len(speed) > 10 else [len(speed) // 2]
        
    primary_cut = minima_indices[0]
    
    # Window of deceleration (prior to plant)
    start_window = max(0, primary_cut - 8) # ~0.8s prior
    decel_phase_a_t = a_t[start_window:primary_cut]
    decel_phase_j_t = j_t[start_window:primary_cut]
    
    peak_decel = np.min(decel_phase_a_t) if len(decel_phase_a_t) > 0 else -5.0 # negative yd/s^2
    peak_decel_jerk = np.min(decel_phase_j_t) if len(decel_phase_j_t) > 0 else -10.0 # negative yd/s^3
    
    # Braking duration: time spent decelerating (< -1.0 yd/s^2) leading into the cut
    braking_frames = np.sum(decel_phase_a_t < -1.0)
    braking_duration = max(0.1, braking_frames * dt)
    
    # Exit re-acceleration window (0.5s after plant)
    exit_window = min(len(a_t), primary_cut + 6)
    exit_phase_a_t = a_t[primary_cut:exit_window]
    exit_accel_peak = np.max(exit_phase_a_t) if len(exit_phase_a_t) > 0 else 3.0
    
    # Composite Deceleration Efficiency Index (DEI)
    # Higher value indicates faster, more violent stop with instant re-acceleration
    # DEI = (|peak_decel| * |peak_decel_jerk| * exit_accel_peak) / (braking_duration * 10)
    dei = (np.abs(peak_decel) * np.abs(peak_decel_jerk) * exit_accel_peak) / (braking_duration * 100.0)
    
    return {
        "peak_braking_decel": float(peak_decel),       # yd/s^2 (e.g. -7.5 to -12.0)
        "peak_decel_jerk": float(peak_decel_jerk),         # yd/s^3 (e.g. -15.0 to -35.0)
        "braking_duration": float(braking_duration),       # seconds (e.g. 0.3s to 0.7s)
        "exit_accel_peak": float(exit_accel_peak),         # yd/s^2 (e.g. 3.5 to 6.5)
        "decel_efficiency_index": float(dei)               # Scaled dimensionless index
    }
