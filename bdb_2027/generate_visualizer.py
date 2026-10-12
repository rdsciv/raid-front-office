"""
Builds the standalone, zero-dependency interactive visualizer (visualizer.html)
with dual-mode support (Empirical Kaggle NFL Data vs. Synthetic Calibration Cohort).
"""

import os
import sys
import json
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))
from scout_screener import load_synthetic_cohorts, load_empirical_cohorts

synthetic_cohorts = load_synthetic_cohorts()
empirical_cohorts = load_empirical_cohorts()

def package_cohort_data(cohorts_dict):
    export_data = {}
    for k, c in cohorts_dict.items():
        df = c["df"]
        records = []
        for _, row in df.iterrows():
            records.append({
                "name": str(row.get("player_name", row.get("name", "Prospect"))),
                "pick": int(row.get("draft_pick", row.get("pick", 100))),
                "trad": round(float(row[c["trad"]]), 2),
                "kin": round(float(row[c["kin"]]), 1),
                "target": round(float(row[c["target"]]), 2),
                "z_trad": round(float(row.get("z_trad", 0.0)), 2),
                "z_kin": round(float(row.get("z_kin", 0.0)), 2),
                "classification": str(row.get("classification", "📋 DEPTH / BACKUP")),
                "college": str(row.get("college", ""))
            })
        export_data[k] = {
            "name": c["name"],
            "trad_label": c["trad_label"],
            "kin_label": c["kin_label"],
            "target_label": c["target_label"],
            "unit": c["unit"],
            "players": records
        }
    return export_data

all_modes_data = {
    "empirical": package_cohort_data(empirical_cohorts) if empirical_cohorts else None,
    "synthetic": package_cohort_data(synthetic_cohorts)
}

json_payload = json.dumps(all_modes_data, indent=2)

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NFL Big Data Bowl 2027 | Unified Kinematic Translation Engine (UKTE)</title>
  <style>
    :root {{
      --bg: #0b0f19;
      --card-bg: #111827;
      --card-border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --blue: #3b82f6;
      --blue-glow: rgba(59, 130, 246, 0.2);
      --red: #ef4444;
      --green: #10b981;
      --amber: #f59e0b;
      --purple: #8b5cf6;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 24px;
      line-height: 1.5;
    }}
    header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--card-border);
    }}
    h1 {{
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    .badge-blue {{ background: #1e3a8a; color: #93c5fd; border: 1px solid #2563eb; }}
    .badge-green {{ background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }}
    .badge-red {{ background: #7f1d1d; color: #fca5a5; border: 1px solid #b91c1c; }}

    .mode-toggle {{
      display: flex;
      gap: 6px;
      background: #1f2937;
      padding: 4px;
      border-radius: 8px;
    }}
    .mode-btn {{
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }}
    .mode-btn.active {{
      background: #2563eb;
      color: white;
    }}

    .nav-tabs {{
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }}
    .tab-btn {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-muted);
      padding: 10px 18px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.2s;
    }}
    .tab-btn.active {{
      background: #1e40af;
      color: #ffffff;
      border-color: #3b82f6;
      box-shadow: 0 0 15px var(--blue-glow);
    }}

    .grid {{
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 20px;
    }}
    .card {{
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 20px;
    }}
    .card-title {{
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    /* Scatter Plot */
    #scatter-canvas {{
      width: 100%;
      height: 440px;
      background: #0d1322;
      border-radius: 8px;
      cursor: crosshair;
    }}

    /* Drill Canvas */
    #drill-canvas {{
      width: 100%;
      height: 220px;
      background: #0d1322;
      border-radius: 8px;
      margin-bottom: 12px;
    }}
    .drill-controls {{
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 16px;
    }}
    .btn {{
      background: #2563eb;
      color: white;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }}
    .btn:hover {{ background: #1d4ed8; }}

    /* Calculator */
    .calc-row {{
      margin-bottom: 14px;
    }}
    .calc-row label {{
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
      font-weight: 600;
    }}
    .calc-row input[type="range"] {{
      width: 100%;
      accent-color: #3b82f6;
    }}
    .calc-row .val-disp {{
      float: right;
      font-weight: 700;
      color: #60a5fa;
    }}
    .result-box {{
      background: #1e293b;
      padding: 14px;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
      margin-top: 14px;
    }}

    /* Prospect details tooltip */
    #prospect-detail {{
      background: #1f2937;
      padding: 12px;
      border-radius: 8px;
      margin-top: 12px;
      font-size: 12px;
      border: 1px solid #374151;
      min-height: 52px;
    }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>🏈 NFL Big Data Bowl 2027: UKTE Visualizer</h1>
      <p style="color: var(--text-muted); font-size: 13px; margin-top: 4px;">
        10 Hz Combine Kinematic Signal Translation to Regular-Season NFL Game Performance
      </p>
    </div>
    <div style="display: flex; align-items: center; gap: 12px;">
      <div class="mode-toggle">
        <button class="mode-btn active" id="btn-mode-emp" onclick="setMode('empirical')">⚡ Real Kaggle NFL Data</button>
        <button class="mode-btn" id="btn-mode-syn" onclick="setMode('synthetic')">🔬 Calibration Model</button>
      </div>
      <span class="badge badge-green">Savitzky-Golay 10 Hz</span>
    </div>
  </header>

  <div class="nav-tabs">
    <button class="tab-btn active" onclick="switchArchetype('wr')">Wide Receivers & Tight Ends (DEI)</button>
    <button class="tab-btn" onclick="switchArchetype('edge')">EDGE Rushers & DL (Effective Bend)</button>
    <button class="tab-btn" onclick="switchArchetype('cb')">Defensive Backs (Hip Fluidity)</button>
    <button class="tab-btn" onclick="switchArchetype('trench')">Interior Trench & RB (0.5s Impulse)</button>
  </div>

  <div class="grid">
    <!-- Left: Scatter Matrix -->
    <div class="card">
      <div class="card-title">
        <span id="matrix-title">Evaluator Decision Matrix (Sleeper Alpha vs. Bust Traps)</span>
        <span style="font-size: 12px; color: var(--text-muted);" id="prospect-count-lbl">Showing real prospects</span>
      </div>
      <canvas id="scatter-canvas" width="600" height="440"></canvas>
      <div id="prospect-detail">
        <strong>Hover over any prospect</strong> on the decision matrix to view their stopwatch time, 10 Hz kinematic score, NFL outcome, and scouting diagnosis.
      </div>
    </div>

    <!-- Right: Kinematics Simulator & Front-Office Calculator -->
    <div>
      <div class="card" style="margin-bottom: 20px;">
        <div class="card-title">
          <span id="drill-title">10 Hz Drill Trajectory Simulator</span>
          <span class="badge badge-blue" id="drill-badge">20-Yd Shuttle Plant</span>
        </div>
        <canvas id="drill-canvas" width="400" height="220"></canvas>
        <div class="drill-controls">
          <button class="btn" onclick="togglePlay()">Play / Pause</button>
          <button class="btn" style="background: #374151;" onclick="resetAnim()">Reset</button>
          <span style="font-size: 12px; color: var(--text-muted);" id="anim-frame-lbl">Frame: 0 / 40</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Front-Office Marginal Performance Calculator</span>
          <span class="badge badge-green">Live Regression</span>
        </div>
        <div class="calc-row">
          <label><span id="calc-trad-lbl">Shuttle Time (s)</span>: <span class="val-disp" id="calc-trad-val">4.15</span></label>
          <input type="range" id="input-trad" min="3.90" max="4.60" step="0.01" value="4.15" oninput="recalc()">
        </div>
        <div class="calc-row">
          <label><span id="calc-kin-lbl">Decel Efficiency Index (DEI)</span>: <span class="val-disp" id="calc-kin-val">38.0</span></label>
          <input type="range" id="input-kin" min="5.0" max="50.0" step="0.5" value="38.0" oninput="recalc()">
        </div>
        <div class="calc-row">
          <label>Draft Round Selection: <span class="val-disp" id="calc-pick-val">Pick #64 (Round 2)</span></label>
          <input type="range" id="input-pick" min="1" max="220" step="1" value="64" oninput="recalc()">
        </div>

        <div class="result-box">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8;">Forecasted NFL Game Metric:</div>
          <div style="font-size: 22px; font-weight: 800; color: #60a5fa; margin: 4px 0;" id="calc-result-metric">3.45 yd Separation</div>
          <div style="font-size: 12px; color: #e2e8f0;" id="calc-result-diag">💎 High Kinematic Value: Projected starter with elite route-stem separation.</div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const allData = {json_payload};
    let currentMode = allData.empirical ? 'empirical' : 'synthetic';
    let currentArchetype = 'wr';
    let hoveredPlayer = null;

    function setMode(mode) {{
      currentMode = mode;
      document.getElementById('btn-mode-emp').classList.toggle('active', mode === 'empirical');
      document.getElementById('btn-mode-syn').classList.toggle('active', mode === 'synthetic');
      updateUI();
      drawScatter();
      recalc();
    }}

    function switchArchetype(key) {{
      currentArchetype = key;
      document.querySelectorAll('.tab-btn').forEach((btn, idx) => {{
        const keys = ['wr', 'edge', 'cb', 'trench'];
        btn.classList.toggle('active', keys[idx] === key);
      }});
      updateUI();
      drawScatter();
      resetAnim();
      recalc();
    }}

    function getCurrentDataset() {{
      return allData[currentMode][currentArchetype];
    }}

    function updateUI() {{
      const d = getCurrentDataset();
      const modeName = (currentMode === 'empirical') ? 'Real NFL Prospects (2023-2025)' : 'Calibration Model';
      document.getElementById('matrix-title').innerText = `${{d.name}}: Decision Matrix (${{modeName}})`;
      document.getElementById('prospect-count-lbl').innerText = `Total ${{d.players.length}} evaluated`;
      document.getElementById('drill-title').innerText = `10 Hz ${{d.name}} Drill Kinematics`;
      document.getElementById('calc-trad-lbl').innerText = d.trad_label;
      document.getElementById('calc-kin-lbl').innerText = d.kin_label;
      
      const badge = document.getElementById('drill-badge');
      if (currentArchetype === 'wr') badge.innerText = '20-Yd Shuttle (Braking Jerk)';
      if (currentArchetype === 'edge') badge.innerText = '3-Cone Apex (Centripetal Bend)';
      if (currentArchetype === 'cb') badge.innerText = 'Hip Flip (Phase Latency)';
      if (currentArchetype === 'trench') badge.innerText = '0-0.5s Impulse Window';
    }}

    // Scatter Canvas Rendering
    const canvas = document.getElementById('scatter-canvas');
    const ctx = canvas.getContext('2d');

    function drawScatter() {{
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const d = getCurrentDataset();
      const players = d.players;

      const w = canvas.width;
      const h = canvas.height;
      const pad = 50;
      const cx = pad + (w - 2 * pad) / 2;
      const cy = pad + (h - 2 * pad) / 2;

      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(pad, pad, w - 2 * pad, h - 2 * pad);

      ctx.strokeStyle = '#374151';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cx, pad); ctx.lineTo(cx, h - pad);
      ctx.moveTo(pad, cy); ctx.lineTo(w - pad, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#475569';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.fillText('QUADRANT 2: HIDDEN SLEEPERS 💎', pad + 10, pad + 20);
      ctx.fillText('QUADRANT 1: ELITE CONSENSUS ⭐', cx + 10, pad + 20);
      ctx.fillText('QUADRANT 3: DEPTH / BACKUP', pad + 10, h - pad - 10);
      ctx.fillText('QUADRANT 4: BUST TRAPS 🚨', cx + 10, h - pad - 10);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Traditional Speed z-score (Slow ◄─► Fast)`, cx, h - 15);
      
      ctx.save();
      ctx.translate(18, cy);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`10 Hz Kinematic Score z-score (Elite ▲)`, 0, 0);
      ctx.restore();

      players.forEach(p => {{
        const z_t = Math.max(-2.5, Math.min(2.5, p.z_trad));
        const z_k = Math.max(-2.5, Math.min(2.5, p.z_kin));
        const px = cx + (z_t / 2.5) * ((w - 2 * pad) / 2);
        const py = cy - (z_k / 2.5) * ((h - 2 * pad) / 2);

        let color = '#94a3b8';
        let rad = 4;
        if (p.classification.includes('SLEEPER')) {{ color = '#3b82f6'; rad = 7; }}
        else if (p.classification.includes('BUST')) {{ color = '#ef4444'; rad = 7; }}
        else if (p.classification.includes('ELITE')) {{ color = '#10b981'; rad = 5; }}

        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = (p === hoveredPlayer) ? 2 : 0.5;
        ctx.stroke();

        p._px = px;
        p._py = py;
      }});
    }}

    canvas.addEventListener('mousemove', (e) => {{
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      const d = getCurrentDataset();

      hoveredPlayer = null;
      for (const p of d.players) {{
        const dist = Math.hypot(p._px - mx, p._py - my);
        if (dist < 8) {{
          hoveredPlayer = p;
          break;
        }}
      }}
      drawScatter();

      const detailDiv = document.getElementById('prospect-detail');
      if (hoveredPlayer) {{
        const collegeText = hoveredPlayer.college ? ` (${{hoveredPlayer.college}})` : '';
        detailDiv.innerHTML = `
          <strong>${{hoveredPlayer.name}}</strong>${{collegeText}} | Draft Pick #${{hoveredPlayer.pick}} | 
          <span style="color: #60a5fa;">${{hoveredPlayer.classification}}</span><br>
          • <strong>Stopwatch Drill</strong>: ${{hoveredPlayer.trad}}s &nbsp;|&nbsp;
          • <strong>10 Hz Kinematic</strong>: ${{hoveredPlayer.kin}} &nbsp;|&nbsp;
          • <strong>NFL Game Result</strong>: ${{hoveredPlayer.target}}${{d.unit}}
        `;
      }} else {{
        detailDiv.innerHTML = '<strong>Hover over any prospect</strong> on the decision matrix to view their stopwatch time, 10 Hz kinematic score, NFL outcome, and scouting diagnosis.';
      }}
    }});

    // Drill Animation
    const drillCanvas = document.getElementById('drill-canvas');
    const drillCtx = drillCanvas.getContext('2d');
    let animFrame = 0;
    let isPlaying = true;

    function renderDrill() {{
      drillCtx.clearRect(0, 0, drillCanvas.width, drillCanvas.height);
      const w = drillCanvas.width;
      const h = drillCanvas.height;

      drillCtx.strokeStyle = '#1e2937';
      drillCtx.lineWidth = 1;
      for (let x = 30; x < w; x += 40) {{
        drillCtx.beginPath();
        drillCtx.moveTo(x, 20); drillCtx.lineTo(x, h - 20);
        drillCtx.stroke();
      }}

      const progress = (animFrame % 60) / 60;
      if (currentArchetype === 'wr') {{
        let px = 60 + Math.sin(progress * Math.PI * 2) * 120;
        let py = h / 2;
        drillCtx.fillStyle = '#3b82f6';
        drillCtx.beginPath();
        drillCtx.arc(px, py, 9, 0, Math.PI * 2);
        drillCtx.fill();

        drillCtx.strokeStyle = '#ef4444';
        drillCtx.lineWidth = 3;
        drillCtx.beginPath();
        drillCtx.moveTo(px, py);
        drillCtx.lineTo(px - Math.cos(progress * Math.PI * 2) * 35, py);
        drillCtx.stroke();

        drillCtx.fillStyle = '#ef4444';
        drillCtx.font = '10px monospace';
        drillCtx.fillText('Braking Vector', px - 30, py - 15);
      }} else if (currentArchetype === 'edge') {{
        let angle = progress * Math.PI * 1.5;
        let px = w / 2 + Math.cos(angle) * 60;
        let py = h / 2 + Math.sin(angle) * 60;

        drillCtx.fillStyle = '#f59e0b';
        drillCtx.beginPath();
        drillCtx.arc(w / 2, h / 2, 7, 0, Math.PI * 2);
        drillCtx.fill();

        drillCtx.fillStyle = '#3b82f6';
        drillCtx.beginPath();
        drillCtx.arc(px, py, 9, 0, Math.PI * 2);
        drillCtx.fill();

        drillCtx.strokeStyle = '#10b981';
        drillCtx.lineWidth = 2.5;
        drillCtx.beginPath();
        drillCtx.moveTo(px, py);
        drillCtx.lineTo(w / 2, h / 2);
        drillCtx.stroke();
      }} else {{
        let px = 50 + progress * (w - 100);
        let py = h / 2;
        drillCtx.fillStyle = '#3b82f6';
        drillCtx.beginPath();
        drillCtx.arc(px, py, 9, 0, Math.PI * 2);
        drillCtx.fill();
      }}

      document.getElementById('anim-frame-lbl').innerText = `Frame: ${{animFrame % 60}} / 60 (10 Hz)`;

      if (isPlaying) animFrame++;
      requestAnimationFrame(renderDrill);
    }}

    function togglePlay() {{ isPlaying = !isPlaying; }}
    function resetAnim() {{ animFrame = 0; }}

    function recalc() {{
      const trad = parseFloat(document.getElementById('input-trad').value);
      const kin = parseFloat(document.getElementById('input-kin').value);
      const pick = parseInt(document.getElementById('input-pick').value);

      document.getElementById('calc-trad-val').innerText = trad.toFixed(2);
      document.getElementById('calc-kin-val').innerText = kin.toFixed(1);
      document.getElementById('calc-pick-val').innerText = `Pick #${{pick}} (Rd ${{Math.ceil(pick/32)}})`;

      let metricVal, metricStr, diagStr;
      if (currentArchetype === 'wr') {{
        metricVal = 2.40 + (0.55 * (kin - 25) / 10) - (0.35 * (trad - 4.22) / 0.12) - (0.25 * (pick - 100) / 70);
        metricStr = `${{Math.max(1.1, Math.min(4.2, metricVal)).toFixed(2)}} yd Separation`;
        diagStr = (kin > 20) ? '💎 Elite Route-Stem Separator. Top-tier Day 2 / Day 3 sleeper.' : '🚨 Stiff Breaker: High risk of being blanketed in man coverage.';
      }} else if (currentArchetype === 'edge') {{
        metricVal = 14.5 + (4.8 * (kin - 50) / 15) - (2.2 * (trad - 7.12) / 0.18) - (2.5 * (pick - 100) / 70);
        metricStr = `${{Math.max(4.0, Math.min(28.5, metricVal)).toFixed(1)}}% Disruption`;
        diagStr = (kin > 70) ? '💎 Elite Arc Bend: Consistently corners around NFL tackles.' : '🚨 Flattened Arc: Easily washed past the pocket by NFL tackles.';
      }} else if (currentArchetype === 'cb') {{
        metricVal = 0.02 - (0.16 * (kin - 13) / 4.5) + (0.06 * (trad - 4.44) / 0.08) + (0.07 * (pick - 100) / 70);
        metricStr = `${{Math.max(-0.32, Math.min(0.45, metricVal)).toFixed(2)}} Target EPA`;
        diagStr = (kin > 20) ? '💎 Shutdown Hip Fluidity: Minimal phase transition latency.' : '🚨 High Burn Risk: Susceptible to stem double-moves.';
      }} else {{
        metricVal = 1.65 + (0.48 * (kin - 11.5) / 3.0) - (0.22 * (trad - 1.68) / 0.07) - (0.24 * (pick - 100) / 70);
        metricStr = `${{Math.max(0.4, Math.min(3.2, metricVal)).toFixed(2)}} yd Leverage`;
        diagStr = (kin > 16) ? '💎 Explosive Trench Leverage: Resets the line of scrimmage immediately.' : '🚨 Stance Delay: Loses immediate pad level leverage.';
      }}

      document.getElementById('calc-result-metric').innerText = metricStr;
      document.getElementById('calc-result-diag').innerText = diagStr;
    }}

    updateUI();
    drawScatter();
    requestAnimationFrame(renderDrill);
    recalc();
  </script>
</body>
</html>
"""

visualizer_path = "bdb_2027/visualizer.html"
with open(visualizer_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Dual-mode interactive visualizer updated successfully at: {visualizer_path}")
