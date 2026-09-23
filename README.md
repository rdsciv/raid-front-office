# 🏈 RAID: Front Office
### High-Leverage NFL Sports Representation & Contract Negotiation Simulation

[![Deploy to GitHub Pages](https://github.com/rdsciv/raid-front-office/actions/workflows/deploy.yml/badge.svg)](https://github.com/rdsciv/raid-front-office/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Play%20Online-GitHub%20Pages-blue?style=flat&logo=github)](https://rdsciv.github.io/raid-front-office/)

**RAID: Front Office** is a tactical sports agency simulation game. Players step into the role of Lead Strategist at **RAID**—a high-stakes sports agency specializing in evidence-based player valuation, roster continuity modeling, and market-resetting NFL contract negotiations against real NFL General Managers.

---

## 🎮 Play the Game Online
👉 **[Launch RAID: Front Office on GitHub Pages](https://rdsciv.github.io/raid-front-office/)**

---

## ⚡ The RAID Methodology

1. **The Leverage Clock**: Timing is non-negotiable. Track external catalysts (cap spikes, franchise tag deadlines, rival player deals) to close before third-party rooms set the player's market floor.
2. **Replacement Cost & Option Value**: Price contract extensions against the team's opportunity cost of drafting a replacement (e.g. consuming premium first-round picks that must address scarce positions like Edge rusher or CB).
3. **Continuity Insurance**: Frame retention as championship-window preservation, scheme efficiency, and avoided rookie variance (e.g. rookie tackle variance increasing franchise QB sack rates by 42%).
4. **Contract Architecture Over Sticker AAV**: Optimize term, practical guarantees, rolling roster bonus vesting, and Year 1 cash flow rather than hollow headline numbers.

---

## 🌟 Real NFL Superstars & GM Battles

Powered by **Spotrac** and **nflverse** data, the game features official player headshots, team branding, and realistic GM psychological models:

* **Micah Parsons** *(Dallas Cowboys)* vs. **Jerry Jones & Will McClay** *(Win-Now Aggressor)*  
  *Battle to shatter the non-QB market ceiling at $35.5M+ AAV against Dallas' vanity and cap constraints.*
* **Ja'Marr Chase** *(Cincinnati Bengals)* vs. **Duke Tobin** *(Cap Conservative)*  
  *Test Cincinnati's strict cash-in-escrow policy to top Justin Jefferson's record extension.*
* **Tristan Wirfs** *(Tampa Bay Buccaneers)* vs. **Jason Licht** *(Protection GM)*  
  *Reset the blindside offensive tackle market beyond Penei Sewell to protect Baker Mayfield.*
* **Kyle Hamilton** *(Baltimore Ravens)* vs. **Eric DeCosta** *(Analytics / Comp-Pick Master)*  
  *Challenge the safety ceiling for an irreplaceable disguise defensive chess piece.*
* **Sauce Gardner** *(New York Jets)* vs. **Joe Douglas** *(Discipline Value GM)*  
  *Lockdown perimeter cornerback seeking to surpass Patrick Surtain II's benchmark.*
* **Breece Hall** *(New York Jets)* vs. **Joe Douglas** *(Cap Conservative)*  
  *Fight for front-loaded practical guarantees before the physical cliff.*

---

## 🛠️ Key Systems & Features

* **Evidence War Room Dossiers**: Interactive sheets breaking down thesis statements, leverage catalyst timelines, replacement cost models, and historical Spotrac market comparables.
* **Turn-Based GM Negotiation Arena**: Dynamic battle screen with GM psychological meters (Patience / Walkout Risk, Acceptance Probability, Emotion States), live dialogue feed, and RAID tactical action deck.
* **Interactive Contract Architecture Suite**: Real-time sliders for Term (1–5 yrs), AAV ($8M–$35M), Practical Guarantees, and Year 1 Cash Flow % with instant validation.
* **Procedural Sound Engine**: Synthesized audio effects via browser Web Audio API (UI clicks, tension alarms, deal completion fanfares). Zero external audio assets required.
* **Offseason Calendar & News Ticker**: Advance through 6 phases (NFL Combine, Tag Window, Legal Tampering, Free Agency Wave 1, Pre-Draft, Draft Weekend).
* **Talent Scouting Board**: Recruit collegiate phenoms (e.g. Travis Hunter) and disgruntled trade targets (e.g. Trey Hendrickson).

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/rdsciv/raid-front-office.git
cd raid-front-office

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 📊 Live Data Sync

To re-fetch and synchronize live NFL player rosters, official headshots, and team logos from **nflverse** and contract benchmarks from **Spotrac**:

```bash
python3 scripts/sync_nfl_data.py
```

---

## 📜 License
MIT License. Built for sports strategy enthusiasts, contract strategists, and football fans.
