"""
Kinematic Signal Processing Engine for 10 Hz NFL Combine & NGS Tracking Data.
Provides mathematically rigorous smoothing, vector calculus, and phase segmentation.
"""

import numpy as np
from scipy.signal import savgol_filter


def smooth_trajectory(x, y, window_length=7, polyorder=2):
    """
    Applies Savitzky-Golay smoothing filter to 10 Hz trajectory coordinates.
    Maintains peak acceleration and cornering dynamics while attenuating sensor jitter.
    """
    if len(x) < window_length:
        window_length = len(x) if len(x) % 2 == 1 else len(x) - 1
        if window_length < 3:
            return np.array(x, dtype=float), np.array(y, dtype=float)
        polyorder = min(polyorder, window_length - 1)
    
    x_smooth = savgol_filter(x, window_length=window_length, polyorder=polyorder)
    y_smooth = savgol_filter(y, window_length=window_length, polyorder=polyorder)
    return x_smooth, y_smooth


def compute_kinematics(x, y, orientations=None, dt=0.1):
    """
    Computes comprehensive 2D vector kinematics from 10 Hz spatial coordinates:
    - Speed s (yd/s)
    - Tangential acceleration a_t (yd/s^2): positive = drive, negative = braking
    - Normal / centripetal acceleration a_n (yd/s^2): lateral turn loading
    - Curvature kappa (1/yd): path curvature
    - Jerk j_t (yd/s^3): rate of acceleration change
    - Slip angle beta (deg): divergence between velocity vector and torso orientation
    """
    x = np.asarray(x, dtype=float)
    y = np.asarray(y, dtype=float)
    n = len(x)

    # 1st derivatives: Velocity
    vx = np.gradient(x, dt)
    vy = np.gradient(y, dt)
    speed = np.sqrt(vx**2 + vy**2)
    speed_safe = np.where(speed < 1e-4, 1e-4, speed)

    # 2nd derivatives: Acceleration
    ax = np.gradient(vx, dt)
    ay = np.gradient(vy, dt)
    accel_mag = np.sqrt(ax**2 + ay**2)

    # Tangential acceleration (rate of change of linear speed)
    a_tangential = (vx * ax + vy * ay) / speed_safe

    # Normal / centripetal acceleration (perpendicular turning force)
    cross_product = vx * ay - vy * ax
    a_normal = np.abs(cross_product) / speed_safe

    # Trajectory Curvature kappa = |vx*ay - vy*ax| / (vx^2 + vy^2)^(3/2)
    curvature = np.abs(cross_product) / (speed_safe**3)

    # 3rd derivatives: Tangential Jerk (rate of force application)
    jerk_tangential = np.gradient(a_tangential, dt)

    # Direction of motion (heading of velocity vector in degrees, 0-360)
    vel_heading_rad = np.arctan2(vy, vx)
    vel_heading_deg = np.mod(np.degrees(vel_heading_rad), 360.0)

    # Slip angle / Discrepancy if orientation is provided
    slip_angle = np.zeros(n)
    if orientations is not None:
        orientations = np.asarray(orientations, dtype=float)
        # Angular difference wrapped between -180 and +180 degrees
        diff = vel_heading_deg - orientations
        diff = (diff + 180.0) % 360.0 - 180.0
        slip_angle = np.abs(diff)

    return {
        "x": x,
        "y": y,
        "vx": vx,
        "vy": vy,
        "speed": speed,
        "ax": ax,
        "ay": ay,
        "accel_mag": accel_mag,
        "a_tangential": a_tangential,
        "a_normal": a_normal,
        "curvature": curvature,
        "jerk_tangential": jerk_tangential,
        "vel_heading_deg": vel_heading_deg,
        "slip_angle": slip_angle,
        "dt": dt
    }
