"""
Automated Comprehensive Test Suite for the NFL Big Data Bowl 2027 UKTE.
Validates:
1. Savitzky-Golay filtering & vector calculus properties.
2. Positional kinematic extractors across all four archetypes.
3. Nested regression translation models, Likelihood Ratio Tests, and information criteria.
4. Spatio-Temporal Graph Neural Network (ST-GNN) message passing and temporal attention.
5. Scouting decision matrix classification integrity.
"""

import os
import sys
import unittest
import numpy as np
import pandas as pd

# Add bdb_2027/src to python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from kinematics import smooth_trajectory, compute_kinematics
from wr_deceleration import extract_wr_deceleration_metrics
from edge_bend import extract_edge_bend_metrics
from cb_fluidity import extract_cb_fluidity_metrics
from trench_impulse import extract_trench_impulse_metrics
from translation_models import evaluate_archetype_translation
from spatiotemporal_gnn import SpatialGraphConvLayer, TemporalSelfAttentionLayer, SpatioTemporalMatchupGNN
from scout_screener import load_all_cohorts


class TestKinematicSignalProcessing(unittest.TestCase):
    def setUp(self):
        # Create a synthetic 10 Hz noisy trajectory
        self.t = np.linspace(0, 4, 40)
        self.x = 2.0 * self.t + np.random.normal(0, 0.05, 40)
        self.y = np.sin(self.t) + np.random.normal(0, 0.05, 40)

    def test_smooth_trajectory_preserves_shape(self):
        xs, ys = smooth_trajectory(self.x, self.y, window_length=7, polyorder=2)
        self.assertEqual(len(xs), len(self.x))
        self.assertEqual(len(ys), len(self.y))
        # Variance of second differences should be reduced after smoothing
        raw_jitter = np.var(np.diff(self.x, n=2))
        smooth_jitter = np.var(np.diff(xs, n=2))
        self.assertLess(smooth_jitter, raw_jitter)

    def test_smooth_trajectory_short_input_fallback(self):
        short_x = np.array([1.0, 2.0])
        short_y = np.array([3.0, 4.0])
        xs, ys = smooth_trajectory(short_x, short_y, window_length=7)
        self.assertEqual(len(xs), 2)
        np.testing.assert_array_equal(xs, short_x)

    def test_compute_kinematics_derivatives(self):
        kin = compute_kinematics(self.x, self.y, dt=0.1)
        self.assertIn("speed", kin)
        self.assertIn("a_tangential", kin)
        self.assertIn("a_normal", kin)
        self.assertIn("curvature", kin)
        self.assertIn("jerk_tangential", kin)
        self.assertIn("slip_angle", kin)

        # Speed and normal acceleration must be strictly non-negative
        self.assertTrue(np.all(kin["speed"] >= 0))
        self.assertTrue(np.all(kin["a_normal"] >= 0))
        self.assertTrue(np.all(kin["curvature"] >= 0))


class TestPositionalKinematicExtractors(unittest.TestCase):
    def test_wr_deceleration_extractor(self):
        # 20-yard shuttle plant trajectory
        t = np.linspace(0, 4.2, 42)
        x = np.concatenate([np.linspace(0, 5, 20), np.linspace(5, -5, 22)])
        y = np.zeros(42)
        metrics = extract_wr_deceleration_metrics(x, y)
        self.assertIn("peak_braking_decel", metrics)
        self.assertIn("peak_decel_jerk", metrics)
        self.assertIn("braking_duration", metrics)
        self.assertIn("decel_efficiency_index", metrics)
        self.assertGreater(metrics["decel_efficiency_index"], 0.0)

    def test_edge_bend_extractor(self):
        # Circular turn arc trajectory
        theta = np.linspace(0, np.pi, 30)
        x = 3.0 * np.cos(theta)
        y = 3.0 * np.sin(theta)
        metrics = extract_edge_bend_metrics(x, y)
        self.assertIn("apex_curvature", metrics)
        self.assertIn("apex_centripetal_accel", metrics)
        self.assertIn("velocity_retention_ratio", metrics)
        self.assertIn("effective_bend_index", metrics)
        self.assertGreater(metrics["effective_bend_index"], 0.0)

    def test_cb_fluidity_extractor(self):
        x = np.linspace(0, 10, 30)
        y = np.linspace(0, 2, 30)
        orientations = np.linspace(180, 0, 30)  # Hip flip from backpedal to forward sprint
        metrics = extract_cb_fluidity_metrics(x, y, orientations=orientations)
        self.assertIn("hip_transition_latency", metrics)
        self.assertIn("ke_retention_ratio", metrics)
        self.assertIn("db_fluidity_index", metrics)
        self.assertGreater(metrics["hip_transition_latency"], 0.0)
        self.assertGreater(metrics["db_fluidity_index"], 0.0)

    def test_trench_impulse_extractor(self):
        t = np.linspace(0, 1.5, 15)
        x = 0.5 * 6.0 * (t**2)  # High constant acceleration drive
        y = np.zeros(15)
        metrics = extract_trench_impulse_metrics(x, y)
        self.assertIn("impulse_0_5s", metrics)
        self.assertIn("first_step_jerk", metrics)
        self.assertIn("displacement_at_0_5s", metrics)
        self.assertIn("trench_explosiveness_index", metrics)
        self.assertGreater(metrics["trench_explosiveness_index"], 0.0)


class TestStatisticalTranslationModels(unittest.TestCase):
    def test_nested_ols_and_lrt_properties(self):
        rng = np.random.default_rng(101)
        n = 50
        trad = rng.normal(4.2, 0.1, n)
        pick = rng.integers(1, 200, n)
        kin = rng.normal(30.0, 5.0, n)
        # NFL target strongly driven by kin
        target = 2.0 + 0.1 * kin - 0.5 * trad - 0.01 * pick + rng.normal(0, 0.2, n)

        df = pd.DataFrame({"trad": trad, "pick": pick, "kin": kin, "target": target})
        res = evaluate_archetype_translation(df, target_col="target", trad_col="trad", kin_col="kin", draft_col="pick")

        # Enhanced model must explain more variance than baseline
        self.assertGreaterEqual(res["r2_enh"], res["r2_base"])
        self.assertGreater(res["delta_r2"], 0.0)
        # AIC should decrease when valuable signal is added
        self.assertLess(res["delta_aic"], 0.0)
        # Likelihood ratio test statistic must be non-negative
        self.assertGreaterEqual(res["lrt_stat"], 0.0)
        self.assertLess(res["lrt_pvalue"], 0.05)


class TestSpatioTemporalGNN(unittest.TestCase):
    def test_spatial_gcn_layer_dimensions(self):
        layer = SpatialGraphConvLayer(in_features=7, out_features=16)
        H = np.random.randn(4, 7)
        A = np.eye(4) + 0.2 * np.ones((4, 4))
        out = layer.forward(H, A)
        self.assertEqual(out.shape, (4, 16))
        self.assertTrue(np.all(out >= 0))  # ReLU

    def test_temporal_attention_weights_sum_to_one(self):
        layer = TemporalSelfAttentionLayer(embed_dim=8, num_heads=2)
        seq = np.random.randn(10, 4, 8)
        ctx, attn = layer.forward(seq)
        self.assertEqual(ctx.shape, (4, 8))
        self.assertEqual(attn.shape, (10, 10))
        # Each row of attention map must sum to 1.0 (softmax)
        row_sums = np.sum(attn, axis=-1)
        np.testing.assert_allclose(row_sums, np.ones(10), atol=1e-5)

    def test_end_to_end_gnn_forward(self):
        gnn = SpatioTemporalMatchupGNN(in_features=7, hidden_dim=16, out_dim=8)
        frames = [
            {
                "positions": np.array([[0.0, float(i)], [0.5, float(i)-0.5]]),
                "features": np.random.randn(2, 7)
            }
            for i in range(12)
        ]
        pred, attn = gnn.forward(frames)
        self.assertIsInstance(pred, float)
        self.assertFalse(np.isnan(pred))


class TestScoutScreenerIntegrity(unittest.TestCase):
    def test_cohort_classifications(self):
        cohorts = load_all_cohorts()
        self.assertEqual(set(cohorts.keys()), {"wr", "edge", "cb", "trench"})

        valid_classes = {"💎 HIDDEN SLEEPER", "🚨 BUST TRAP", "⭐ ELITE CONSENSUS", "📋 DEPTH / BACKUP"}
        for k, c in cohorts.items():
            df = c["df"]
            self.assertEqual(len(df), 60)
            assigned_classes = set(df["classification"].unique())
            self.assertTrue(assigned_classes.issubset(valid_classes))
            # Check sleeper count > 0 and bust count > 0
            n_sleepers = np.sum(df["classification"].str.contains("SLEEPER"))
            n_busts = np.sum(df["classification"].str.contains("BUST"))
            self.assertGreater(n_sleepers, 0)
            self.assertGreater(n_busts, 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
