# 🏈 NFL Rookie Card Grading Arbitrage & Analytics Screener

A serverless, static analytics and screening dashboard deployed entirely to **GitHub Pages** via **GitHub Actions**. The dashboard cross-references NFL player usage and efficiency metrics with sports card pricing comps and PSA grading population data to identify grading arbitrage opportunities—highlighting rookie cards where on-field production leads market pricing and raw-to-PSA 10 spreads yield positive expected value (+EV).

---

## ⚡ Architecture & Hosting (GitHub Pages)

* **Frontend**: Vite + React, TypeScript, Tailwind CSS, TanStack Table v8, Recharts, Lucide Icons.
* **Hosting**: GitHub Pages (static site deployment via GitHub Actions).
* **Data Architecture**: Static flat JSON files (`public/data/arbitrage_data.json`, `public/data/players.json`, `public/data/cards.json`) served directly by GitHub Pages.
* **Automated Data Pipeline**: A scheduled GitHub Actions workflow executing Python (`nfl_data_py`, pandas) to ingest NFL usage metrics and card comps, compute EV models, and publish updated JSON files.

---

## 📐 Mathematical Models & Quantitative Front Office Logic

### 1. Expected Value ($EV$) Calculation

The client-side dashboard calculates Expected Value ($EV$) dynamically based on current market parameters:

$$EV = \left[ (P_{10} \times V_{10} \times (1 - F_{sell})) + (P_{9} \times V_{9} \times (1 - F_{sell})) + ((1 - P_{10} - P_{9}) \times V_{raw} \times (1 - F_{sell})) \right] - (C_{raw} + C_{grade} + C_{ship})$$

$$\text{ROI} = \left( \frac{EV}{C_{raw} + C_{grade} + C_{ship}} \right) \times 100$$

* **$P_{10}$**: PSA 10 Gem Rate (`psa_10 / psa_total`), adjustable with a stricter grading haircut penalty.
* **$P_{9}$**: PSA 9 Rate (`psa_9 / psa_total`).
* **$V_{10}$ / $V_{9}$ / $V_{raw}$**: Median sold comp prices for PSA 10, PSA 9, and Raw condition.
* **$C_{raw}$**: Raw purchase cost (default: median raw comp).
* **$C_{grade}$**: PSA submission fee (default: \$19.00 bulk tier).
* **$C_{ship}$**: Allocated round-trip transit/insurance per card (default: \$3.50).
* **$F_{sell}$**: Seller marketplace and payment transaction fee (default: 13.25%).

### 2. Breakeven Gem Rate ($P_{10}^*$) & Margin of Safety ($\text{MoS}$)

Institutional desks isolate the exact hurdle rate required for zero net loss:

$$P_{10}^* = \frac{\frac{C_{total}}{1 - F_{sell}} - \left[ P_9 V_9 + (1 - P_9) V_{raw} \right]}{V_{10} - V_{raw}}$$

$$\text{Margin of Safety (MoS)} = (P_{10} - P_{10}^*) \times 100$$

If historical gem rate is 58% and $P_{10}^* = 25\%$, the card boasts a **+33% Margin of Safety buffer** against harsh grading variance.

### 3. Weighted Opportunity Rating (WOPR)

$$\text{WOPR} = 1.5 \times \text{target\_share} + 0.7 \times \text{air\_yards\_share}$$

Tracks leading usage indicators that precede hobby card price spikes before mainstream market comps adjust.

---

## 🏛️ Front Office Feature Suite

* **Quant Strategy Presets**: One-click screening for:
  * `🔥 Top Alpha`: Filters cards with projected $\text{ROI} \ge 25\%$.
  * `🛡️ Margin of Safety`: Filters cards where gem rate exceeds breakeven by $\ge 15\%$.
  * `📈 WOPR Surges`: High on-field offensive momentum with 3-week rolling $\Delta \ge 0.04$.
  * `⚡ Liquid Blue Chips`: Cards with $\text{PSA Total} \ge 150$ and high 7-day transaction velocity.
* **PSA Submission Batch Builder & Manifest Generator**: Model bulk grading orders with aggregated capital outlay, expected net return, blended gem rate, and export formatted CSV manifests for PSA submission forms.
* **Scenario Stress-Testing Matrix**: 5×4 sensitivity matrix simulating price pullbacks (-20% to +20%) against gem rate standard tightening (-20% to +10%).
* **Pearson $r$ Correlation**: Visualizes dual-axis correlation between weekly on-field WOPR and sports card market comp appreciation.
* **Terminal Density Toggle**: Switch between detailed view and dense high-information terminal view.

---

## 📁 Repository Structure

```
├── .github/
│   └── workflows/
│       ├── deploy.yml            # Builds Vite app and deploys to GitHub Pages
│       └── sync_data.yml         # Scheduled Python script to refresh public/data
├── scripts/
│   ├── requirements.txt          # nfl_data_py, pandas, requests
│   ├── update_data.py            # Generates public/data/arbitrage_data.json
│   └── verify_calculations.js    # Automated mathematical test suite
├── public/
│   └── data/
│       ├── arbitrage_data.json   # Primary static data source for dashboard
│       ├── players.json          # Flattened player usage metrics
│       └── cards.json            # Flattened card comp index
├── src/
│   ├── components/
│   │   ├── ScreenerTable.tsx     # TanStack Table screener with sorting & strategy filters
│   │   ├── ParameterDrawer.tsx   # Slide-over fee & haircut adjustment panel
│   │   ├── PlayerChartModal.tsx  # Dual-axis chart, sensitivity matrix & parallels breakdown
│   │   ├── BatchDrawer.tsx       # Portfolio submission builder & CSV manifest exporter
│   │   └── MetricBadge.tsx       # Badges (MoS, Confidence Tier, WOPR Δ, gem rates)
│   ├── lib/
│   │   ├── calculations.ts       # EV, Breakeven, Margin of Safety, and Batch models
│   │   └── types.ts              # Domain types & interfaces
│   ├── data/
│   │   └── fallbackData.ts       # Bundled baseline fixtures for zero-latency loading
│   ├── App.tsx                   # Main dashboard view & KPI summary cards
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts                # Relative base path ('./') and bundle chunking
└── tailwind.config.js
```

---

## 🚀 GitHub Actions Automation

### 1. `deploy.yml` (Static Site Deployment)
* **Trigger**: Push to `main` branch or manual `workflow_dispatch`.
* **Execution**: Sets up Python 3.11, generates latest static datasets, compiles the Vite application, and publishes `./dist` directly to GitHub Pages via `actions/deploy-pages@v4`.

### 2. `sync_data.yml` (Scheduled Pipeline)
* **Trigger**: Weekly cron (`0 8 * * 2` every Tuesday post-Monday Night Football) or manual dispatch.
* **Execution**: Pulls weekly NFL snap/target stats via `nfl_data_py`, merges card population comps, and commits updated JSON files back to the repository.

---

## 💻 Local Development & Verification

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify Mathematical Formulas
```bash
node scripts/verify_calculations.js
```

### 3. Run Data Ingestion Pipeline
```bash
python3 scripts/update_data.py
```

### 4. Build for Production
```bash
npm run build
```
Outputs static assets into `./dist` configured with relative base paths (`./`) ready for deployment to any GitHub Pages repository or custom domain.
