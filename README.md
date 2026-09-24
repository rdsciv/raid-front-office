# 🏈 RAID: Front Office
### High-Leverage NFL Agency & Contract Negotiation Strategy Game

<div align="center">

[![Play Online](https://img.shields.io/badge/PLAY%20ONLINE%20NOW-GitHub%20Pages-00f0ff?style=for-the-badge&logo=googlechrome&logoColor=black)](https://rdsciv.github.io/raid-front-office/)
[![Status](https://img.shields.io/badge/LIVE%20DEPLOYMENT-Passing-10b981?style=for-the-badge&logo=githubactions&logoColor=white)](https://rdsciv.github.io/raid-front-office/)

### 🎮 **[👉 Click Here to Play the Game in Your Browser 👈](https://rdsciv.github.io/raid-front-office/)**
*Zero installation required. Runs instantly on desktop and mobile browsers.*

</div>

---

## 🎯 About the Game

**RAID: Front Office** puts you in the hot seat as Lead Strategist at **RAID**—an elite, research-driven sports agency. 

Your mission: Represent premier NFL superstars, protect your clients' career earnings, exploit front-office vulnerabilities, and negotiate market-shattering contracts against real NFL General Managers inside an authentic offseason calendar.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  OFFSEASON CALENDAR:  Combine  →  Tag Deadline  →  Tampering  →  Draft      │
│  WAR ROOM:            Replacement Cost  •  Leverage Clock  •  Cash Flow     │
│  GM ARENA:            Jerry Jones  •  Eric DeCosta  •  Duke Tobin           │
│  LIVE DATA:           Connected to Spotrac & nflverse                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🕹️ Quick Start: How to Play

1. **[Launch the Web App](https://rdsciv.github.io/raid-front-office/)** in your browser.
2. **Review Your Client Portfolio**: Select from elite NFL superstars like **Micah Parsons**, **Ja'Marr Chase**, **Tristan Wirfs**, **Kyle Hamilton**, **Sauce Gardner**, and **Breece Hall**.
3. **Inspect the Evidence War Room**: Unpack your client's thesis statement, draft capital replacement costs, and upcoming leverage clock catalysts.
4. **Enter the Negotiation Arena**: Face off against real GMs with distinct psychological archetypes (*Win-Now Aggressors*, *Analytics GMs*, *Cap Conservatives*).
5. **Deploy RAID Tactical Strikes**: Counter GM objections with:
   * **Replacement Cost & Option Value**: Prove that drafting a replacement burns scarce blue-chip draft picks.
   * **Continuity & QB Protection**: Demonstrate the catastrophic pass-rush or scheme breakdown if your client walks.
   * **Cash Flow Restructures**: Concede Year 1 cap flexibility in exchange for monster guaranteed payouts.
   * **Leverage Shocks**: Threaten the open market auction where AFC contenders with $60M+ in cap space are waiting.
6. **Architect the Contract**: Tune real-time sliders for **Term (1–5 yrs)**, **AAV ($8M–$35M)**, **Practical Guarantees**, and **Year 1 Cash Flow %**.
7. **Close the Deal**: Seal the contract before the GM's patience hits zero, bank your 3% agency commission, and advance the offseason calendar!

---

## 🌟 Real NFL Superstars & Front Office Battles

The game is connected directly to **nflverse** (for official NFL headshots, logos, and rosters) and **Spotrac** (for authentic salary cap and contract benchmarks):

| Client | Franchise | Real Front Office | GM Archetype | The Stakes |
| :--- | :--- | :--- | :--- | :--- |
| **Micah Parsons** | Dallas Cowboys | **Jerry Jones & Will McClay** | *Win-Now Aggressor* | Seek \$35.5M+ AAV to become the highest-paid non-QB in NFL history after Dak & CeeDee's deals. |
| **Ja'Marr Chase** | Cincinnati Bengals | **Duke Tobin** | *Cap Conservative* | Challenge Cincinnati's strict cash-in-escrow policy to surpass Justin Jefferson's \$35M AAV benchmark. |
| **Tristan Wirfs** | Tampa Bay Buccaneers | **Jason Licht** | *Protection GM* | Reset the offensive tackle market beyond Penei Sewell to safeguard Baker Mayfield's blindside. |
| **Kyle Hamilton** | Baltimore Ravens | **Eric DeCosta** | *Analytics / Comp-Pick Master* | Shatter the safety ceiling (\$22M AAV) for an irreplaceable defensive disguise weapon. |
| **Sauce Gardner** | New York Jets | **Joe Douglas** | *Analytics / Value GM* | Lockdown perimeter cornerback seeking top-of-market security beyond Patrick Surtain II. |
| **Breece Hall** | New York Jets | **Joe Douglas** | *Cap Conservative* | Three-down dual-threat weapon fighting for front-loaded guarantees before the physical cliff. |

---

## 🔊 Audio & Visual Experience

* **Interactive War Room HUD**: Sleek dark terminal styling with dynamic radar telemetry, live patience meters, and deal probability gauges.
* **Procedural Sound Engine**: Synthesized in real-time via the browser's native **Web Audio API**—feel the tactical clicks, high-stakes GM tension alarms, and triumphant contract victory fanfares.
* **Talent Scouting Board**: Scout and sign collegiate prospects like two-way phenom **Travis Hunter** or disgruntled trade targets like **Trey Hendrickson**.

---

<div align="center">

### 🏆 Ready to reset the NFL market?

### **[▶ PLAY RAID: FRONT OFFICE NOW](https://rdsciv.github.io/raid-front-office/)**

</div>

---

<details>
<summary>🛠️ <b>Developer & Source Code Information (Click to Expand)</b></summary>

### Tech Stack
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **Audio**: Procedural Web Audio API Sound Synthesizer
* **Data Sources**: nflverse (`weekly_rosters`, `teams_colors_logos`), Spotrac Free Agent Tracker
* **Deployment**: GitHub Pages via GitHub Actions CI/CD

### Local Setup
```bash
# Clone and install
git clone https://github.com/rdsciv/raid-front-office.git
cd raid-front-office
npm install

# Start local dev server
npm run dev

# Build production bundle
npm run build
```

### Data Pipeline Sync
To refresh the dataset with live nflverse and Spotrac metrics:
```bash
python3 scripts/sync_nfl_data.py
```

### License
MIT License. Created for sports strategy enthusiasts, contract analysts, and football fans.
</details>
