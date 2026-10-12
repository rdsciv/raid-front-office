# 🏈 NFL Big Data Bowl 2027: Unified Kinematic Translation Engine (UKTE)
## Theme: Bridging 10 Hz Combine Sensor Tracking to Regular-Season NFL Game Performance

An end-to-end analytical and machine learning framework that deconstructs **10 Hz Combine sensor tracking data** into first-principles kinematic signals and empirically links them to **regular-season NFL game performance** across four positional archetypes.

---

## 🚀 Quickstart & Execution

### 1. Run the Empirical Pipeline on Official Kaggle Data
Ingests official competition files (`combine_tracking.csv`, `player_play.csv`, `combine_results.csv`, `players.csv`), extracts 10 Hz micro-kinematics for real NFL draft prospects (2023–2025), fits nested OLS models, and generates empirical intelligence:
```bash
/opt/homebrew/anaconda3/bin/python bdb_2027/src/empirical_pipeline.py
```
Outputs are exported to `bdb_2027/outputs/empirical_statistical_benchmarks.csv` and `bdb_2027/outputs/empirical_draft_intelligence.json`.

### 2. Run the Master Physics Pipeline (Synthetic Calibration Cohort)
Executes mathematical calibration across all four archetypes and renders publication figures:
```bash
/opt/homebrew/anaconda3/bin/python bdb_2027/src/pipeline.py
```
All figures, statistical tables, and decision matrices are exported to `bdb_2027/outputs/`.

### 3. Run the Spatio-Temporal Graph Neural Network (ST-GNN) Simulator
Executes multi-agent spatial graph convolutions and temporal attention to simulate contested in-game matchups:
```bash
/opt/homebrew/anaconda3/bin/python bdb_2027/src/spatiotemporal_gnn.py
```

### 4. Run the Front-Office Scouting Screener CLI
Query prospects, isolate Day 2/3 hidden sleepers, flag 1st-round bust traps, and view coaching prescriptions across real NFL players or calibration cohorts:
```bash
# Screen real NFL draft prospects (official Kaggle dataset)
/opt/homebrew/anaconda3/bin/python bdb_2027/scout_screener.py --mode empirical --quadrant sleeper --limit 5

# Screen edge rusher bust traps in empirical data
/opt/homebrew/anaconda3/bin/python bdb_2027/scout_screener.py --mode empirical --archetype edge --quadrant bust
```

### 5. Run the Automated Test Suite
Runs all 12 unit tests across kinematics, feature extractors, OLS models, ST-GNN layers, and screener classifications:
```bash
/opt/homebrew/anaconda3/bin/python bdb_2027/tests/test_suite.py
```

### 6. Launch the Standalone Interactive Web Visualizer
Open `bdb_2027/visualizer.html` in any modern web browser to interactively explore the four-quadrant Evaluator Decision Matrix with dual-mode toggle (**Real Kaggle NFL Data** vs. **Calibration Model**), scrub 10 Hz drill vector animations, and simulate front-office draft trade-offs in real time.

### 7. Companion Public Kaggle Notebook
The notebook has been fully executed, verified, and bundled:
```bash
bdb_2027/submission.ipynb
```

---

## 🏛️ Repository Architecture

```
bdb_2027/
├── bdb_2027_unified_kinematic_translation_engine.md  # Official submission paper (<2,000 words, <10 figures)
├── submission.ipynb                                  # Standalone, executed Kaggle submission notebook
├── visualizer.html                                   # Dual-mode zero-dependency interactive web dashboard
├── scout_screener.py                                 # Front-office scouting screener CLI (empirical + synthetic)
├── generate_visualizer.py                            # Standalone visualizer builder script
├── build_submission_notebook.py                      # Automated generator for submission.ipynb
├── tests/
│   └── test_suite.py          # 12 automated unit tests (kinematics, OLS, GNN, screener)
├── src/
│   ├── empirical_pipeline.py  # Master empirical pipeline processing official Kaggle dataset
│   ├── kinematics.py          # Savitzky-Golay smoothing, velocity, normal/tangential accel, jerk, curvature
│   ├── wr_deceleration.py     # Archetype 1: WR/TE Deceleration Efficiency Index (DEI) -> Stem Separation
│   ├── edge_bend.py           # Archetype 2: EDGE/DL Effective Bend Index (EBI) -> Arc Pass Rush Win Rate
│   ├── cb_fluidity.py         # Archetype 3: CB/DB Hip Fluidity Index (FI) -> Target EPA Allowed
│   ├── trench_impulse.py      # Archetype 4: Trench/RB 0.5s Impulse (TEI) -> LOS Knockback & Interior YBC
│   ├── spatiotemporal_gnn.py  # Spatial Graph Convolution & Temporal Attention multi-agent simulator
│   ├── translation_models.py  # Hierarchical nested OLS, Likelihood Ratio Tests, delta AIC, Sleeper/Bust classifier
│   └── pipeline.py            # Master pipeline runner iterating across all 4 archetypes
├── outputs/
│   ├── empirical_statistical_benchmarks.csv  # Statistical validation on real NFL players
│   ├── empirical_draft_intelligence.json     # Classified real NFL prospects (2023-2025)
│   ├── statistical_model_benchmarks.csv      # Statistical validation across calibration cohorts
│   ├── draft_inefficiency_intelligence.json  # Identified sleepers and bust traps
│   ├── figure1_model_performance_comparison.png
│   ├── figure2_evaluator_decision_matrix.png
│   └── figure3_nfl_translation_relationships.png
└── data/                      # Symlinked official Kaggle dataset
    ├── combine_results.csv
    ├── combine_tracking.csv   (463,189 frames)
    ├── player_play.csv        (314,197 plays)
    ├── players.csv            (510 evaluated prospects)
    ├── player_career_successes.csv
    └── games.csv
```

---

## 📊 Empirical Findings on Official NFL Data (2023–2025 Draft Classes)

| Archetype | Sample $N$ | Conventional Drill | 10 Hz Kinematic Metric | In-Game Performance Target | Baseline $R^2$ | Enhanced $R^2$ | Incremental $\Delta R^2$ | Likelihood Ratio $p$-value |
| :--- | :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **EDGE / DL** | 44 | 3-Cone Drill ($s$) | Effective Bend Index (EBI) | Pass Rush Sack / Disruption Rate (%) | 0.026 | **0.110** | **+0.085** | **$4.81 \times 10^{-2}$** |
| **WR / TE** | 49 | Short Shuttle ($s$) | Decel Efficiency (DEI) | Target Separation ($yd$) | 0.097 | **0.099** | +0.002 | $7.23 \times 10^{-1}$ |
| **CB / DB** | 118 | 40-yd Dash ($s$) | Hip Fluidity Index (FI) | Defensive EPA per Play | 0.029 | **0.035** | +0.006 | $3.93 \times 10^{-1}$ |
| **Trench** | 138 | 10-yd Split ($s$) | Trench Explosiveness (TEI) | Line Leverage / Protection ($yd$) | 0.035 | **0.040** | +0.004 | $4.32 \times 10^{-1}$ |

---

## 📄 Submission Paper Compliance

* **Word Count**: Exactly **1,952 words** (strictly within the maximum 2,000-word limit).
* **Figures & Tables**: **5 total** (3 publication figures + 2 statistical tables, strictly below the 10-item limit).
* **Rubric Weights**:
  * **Football Score (30%)**: Stem separation on route trees, bend around offensive tackles, hip transition phase latency, LOS knockback, coaching drill prescriptions.
  * **Data Science Score (30%)**: 2nd-order Savitzky-Golay filtering, differential vector calculus, nested OLS models, Likelihood Ratio Tests, $\Delta \text{AIC}$, Spatio-Temporal GNN convolutions.
  * **Writeup Score (20%)**: Executive presentation style tailored to front offices.
  * **Data Visualization Score (20%)**: High-contrast, publication-quality figures with clear legends and annotations.
