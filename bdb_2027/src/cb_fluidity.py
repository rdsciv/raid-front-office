"""
Archetype 3: Defensive Backs (Cornerbacks & Safeties: Hip Fluidity & Transition Latency)
Analyzes backpedal-to-sprint transition and W-drill hip flips to measure phase latency
and energy retention, predicting NFL separation allowed and target EPA in coverage.
"""

import numpy as np
import pandas as pd
from kinematics import compute_kinematics, smooth_trajectory


def extract_cb_fluidity_metrics(x, y, orientations=None, dt=0.1):
    """
    Measures the transition mechanics during a backpedal-to-drive or hip flip phase.
    Extracts latency between torso orientation change and velocity vector realignment,
    along with energy preservation and recovery acceleration.
    """
    x_smooth, y_smooth = smooth_trajectory(x, y)
    kin = compute_kinematics(x_smooth, y_smooth, orientations, dt=dt)
    
    speed = kin["speed"]
    a_t = kin["a_tangential"]
    heading = kin["vel_heading_deg"]
    
    # If orientations not available, estimate orientation from movement trend or simulate
    if orientations is None:
        orientations = np.mod(heading + 180.0, 360.0) # Simulating backpedal
        
    orientations = np.asarray(orientations, dtype=float)
    
    # Calculate angular velocity of torso orientation (deg/s)
    d_theta = np.gradient(orientations, dt)
    # Detect the peak hip flip frame
    flip_peak_idx = int(np.argmax(np.abs(d_theta[2:-2])) + 2) if len(d_theta) > 4 else len(d_theta) // 2
    
    # Find the frame where the velocity heading completes the direction change
    heading_diff = np.abs((heading - heading[0] + 180.0) % 360.0 - 180.0)
    target_aligned_idx = np.where(heading_diff[flip_peak_idx:] > 120.0)[0]
    
    if len(target_aligned_idx) > 0:
        alignment_frame = flip_peak_idx + target_aligned_idx[0]
        transition_latency = max(0.05, (alignment_frame - flip_peak_idx) * dt)
    else:
        transition_latency = 0.25 # default ~0.25s
        
    # Velocity before flip (0.3s prior) vs velocity after flip (0.3s after)
    pre_idx = max(0, flip_peak_idx - 3)
    post_idx = min(len(speed) - 1, flip_peak_idx + 4)
    v_pre = max(0.5, speed[pre_idx])
    v_post = max(0.5, speed[post_idx])
    
    # Kinetic energy retention ratio: (v_post / v_pre)^2
    ke_retention = float(min(1.5, (v_post / v_pre)**2))
    
    # Recovery acceleration (maximum drive after alignment)
    recov_window = a_t[flip_peak_idx:min(len(a_t), flip_peak_idx + 6)]
    recovery_accel = float(np.max(recov_window)) if len(recov_window) > 0 else 3.5
    
    # Fluidity Index (FI):
    # Higher score = near-zero transition lag, high energy preservation, explosive recovery drive
    fluidity_index = float((recovery_accel * ke_retention) / (transition_latency + 0.05))
    
    return {
        "hip_transition_latency": float(transition_latency), # seconds (e.g. 0.10s to 0.40s)
        "ke_retention_ratio": float(ke_retention),           # ratio (e.g. 0.50 to 0.95)
        "recovery_accel": float(recovery_accel),             # yd/s^2 (e.g. 3.0 to 6.5)
        "db_fluidity_index": float(fluidity_index)           # Scaled index (e.g. 8.0 to 35.0)
    }
