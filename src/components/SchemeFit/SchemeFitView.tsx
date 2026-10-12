import React, { useState, useMemo } from 'react';
import { CombineProspect } from '../../lib/combineTypes';
import { 
  NFL_TEAMS_DATABASE, 
  NFL_SCHEME_ARCHETYPES, 
  NFLTeamProfile, 
  SchemeDefinition, 
  SchemeFitResult, 
  calculateSchemeFit 
} from '../../lib/schemeTypes';
import { 
  Shield, 
  Target, 
  Sliders, 
  Sparkles, 
  Download, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Flame, 
  Activity,
  Layers,
  ArrowUpDown,
  Filter
} from 'lucide-react';

interface SchemeFitViewProps {
  prospects: CombineProspect[];
  onSelectProspect: (prospect: CombineProspect) => void;
}

export const SchemeFitView: React.FC<SchemeFitViewProps> = ({ prospects, onSelectProspect }) => {
  // Selected Team & Active Scheme
  const [selectedTeamId, setSelectedTeamId] = useState<string>('SF');
  const [activeCategory, setActiveCategory] = useState<'OFFENSE' | 'DEFENSE'>('OFFENSE');
  const [activeSchemeId, setActiveSchemeId] = useState<string>('shanahan_outside_zone');
  
  // Custom Sliders Toggle & Weights
  const [isCustomizing, setIsCustomizing] = useState<boolean>(false);
  const [customWeights, setCustomWeights] = useState({
    deceleration: 40,
    apex_bend: 15,
    hip_fluidity: 15,
    trench_impulse: 15,
    straight_line: 10,
    size: 5
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedRound, setSelectedRound] = useState<string>('ALL');

  // Active Team Profile
  const currentTeam = useMemo(() => {
    return NFL_TEAMS_DATABASE.find(t => t.id === selectedTeamId) || NFL_TEAMS_DATABASE[0];
  }, [selectedTeamId]);

  // When team changes, update scheme
  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    const team = NFL_TEAMS_DATABASE.find(t => t.id === teamId);
    if (team) {
      const schemeId = activeCategory === 'OFFENSE' 
        ? team.primary_offense_scheme_id 
        : team.primary_defense_scheme_id;
      setActiveSchemeId(schemeId);
    }
  };

  // When category changes, update to team's scheme for that category
  const handleSelectCategory = (cat: 'OFFENSE' | 'DEFENSE') => {
    setActiveCategory(cat);
    const schemeId = cat === 'OFFENSE' 
      ? currentTeam.primary_offense_scheme_id 
      : currentTeam.primary_defense_scheme_id;
    setActiveSchemeId(schemeId);
  };

  // Active Scheme Definition
  const currentScheme = useMemo(() => {
    const base = NFL_SCHEME_ARCHETYPES.find(s => s.id === activeSchemeId) || NFL_SCHEME_ARCHETYPES[0];
    if (!isCustomizing) return base;

    // Apply custom slider weights
    const total = customWeights.deceleration + customWeights.apex_bend + customWeights.hip_fluidity +
                  customWeights.trench_impulse + customWeights.straight_line + customWeights.size || 100;

    return {
      ...base,
      weights: {
        deceleration_weight: customWeights.deceleration / total,
        apex_bend_weight: customWeights.apex_bend / total,
        hip_fluidity_weight: customWeights.hip_fluidity / total,
        trench_impulse_weight: customWeights.trench_impulse / total,
        straight_line_weight: customWeights.straight_line / total,
        size_weight: customWeights.size / total
      }
    };
  }, [activeSchemeId, isCustomizing, customWeights]);

  // Compute Scheme Fit for all prospects
  const evaluatedProspects = useMemo<SchemeFitResult[]>(() => {
    return prospects.map(p => calculateSchemeFit(p, currentScheme));
  }, [prospects, currentScheme]);

  // Filter and sort prospects
  const filteredResults = useMemo(() => {
    return evaluatedProspects.filter(res => {
      const p = res.prospect;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.college.toLowerCase().includes(q) && !p.position.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Position filter
      if (selectedPosition !== 'ALL') {
        if (selectedPosition === 'OL' && !['OT', 'IOL', 'G', 'C', 'T'].includes(p.position)) return false;
        else if (selectedPosition === 'DL' && !['DT', 'DE', 'NT'].includes(p.position)) return false;
        else if (selectedPosition === 'DB' && !['CB', 'S', 'FS', 'SS'].includes(p.position)) return false;
        else if (!['OL', 'DL', 'DB'].includes(selectedPosition) && p.position !== selectedPosition) return false;
      }

      // Tier filter
      if (selectedTier !== 'ALL' && res.tier !== selectedTier) return false;

      // Round filter
      if (selectedRound === 'RD1' && p.draft_round !== 1) return false;
      if (selectedRound === 'DAY2' && (p.draft_round !== 2 && p.draft_round !== 3)) return false;
      if (selectedRound === 'DAY3' && (p.draft_round === 1 || p.draft_round === 2 || p.draft_round === 3)) return false;

      return true;
    }).sort((a, b) => b.fit_score - a.fit_score);
  }, [evaluatedProspects, searchQuery, selectedPosition, selectedTier, selectedRound]);

  // Tier Colors
  const getTierBadge = (tier: SchemeFitResult['tier'], score: number) => {
    if (score >= 85) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-black bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)] flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> {score} • ELITE FIT
        </span>
      );
    }
    if (score >= 75) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-950/80 text-blue-400 border border-blue-500/40">
          {score} • STRONG FIT
        </span>
      );
    }
    if (score >= 65) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 text-slate-300 border border-slate-700">
          {score} • ROLE / DEPTH
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30 flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5" /> {score} • MISFIT
      </span>
    );
  };

  // Export Custom Scheme Board
  const handleExportBoard = () => {
    const exportRows = filteredResults.map(r => ({
      Rank: filteredResults.indexOf(r) + 1,
      Name: r.prospect.name,
      Position: r.prospect.position,
      College: r.prospect.college,
      Draft_Pick: r.prospect.draft_pick ?? 'UDFA',
      Scheme_Fit_Score: r.fit_score,
      Scheme_Tier: r.tier,
      Primary_Driver: r.primary_driver,
      Scouting_Diagnosis: r.scouting_diagnosis,
      Athletic_Score: r.prospect.athletic_score,
      Forty_Yard: r.prospect.drills.forty,
      Short_Shuttle: r.prospect.drills.short_shuttle,
      Three_Cone: r.prospect.drills.three_cone,
      Kinematic_Metric: r.prospect.kinematics.kin_metric_name,
      Kinematic_Score: r.prospect.kinematics.kin_score
    }));

    const blob = new Blob([JSON.stringify(exportRows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTeam.abbreviation}_${currentScheme.id}_scheme_board.json`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Team Selection Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div 
          className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: currentTeam.primary_color }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Team Crest / Logo Pill */}
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl font-mono text-white shadow-lg border border-white/20"
              style={{ backgroundColor: currentTeam.primary_color }}
            >
              {currentTeam.abbreviation}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {currentTeam.city} {currentTeam.name}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  HC: {currentTeam.head_coach}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30">
                  Needs: {currentTeam.draft_needs.join(', ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {currentTeam.scouting_notes}
              </p>
            </div>
          </div>

          {/* Quick Team Selector Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Team:</label>
            <select
              value={selectedTeamId}
              onChange={(e) => handleSelectTeam(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-blue-500 shadow-md cursor-pointer"
            >
              {NFL_TEAMS_DATABASE.map(team => (
                <option key={team.id} value={team.id}>
                  {team.city} {team.name} ({team.abbreviation})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scheme Tab Switcher (Offense vs Defense) */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectCategory('OFFENSE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'OFFENSE'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🏈 Offensive Scheme: {NFL_SCHEME_ARCHETYPES.find(s => s.id === currentTeam.primary_offense_scheme_id)?.short_name}
            </button>
            <button
              onClick={() => handleSelectCategory('DEFENSE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === 'DEFENSE'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              🛡️ Defensive Scheme: {NFL_SCHEME_ARCHETYPES.find(s => s.id === currentTeam.primary_defense_scheme_id)?.short_name}
            </button>
          </div>

          {/* Scheme Presets Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Archetype:</span>
            <select
              value={activeSchemeId}
              onChange={(e) => setActiveSchemeId(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-blue-400 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
            >
              {NFL_SCHEME_ARCHETYPES.filter(s => s.category === activeCategory).map(scheme => (
                <option key={scheme.id} value={scheme.id}>
                  {scheme.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isCustomizing
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isCustomizing ? 'Custom Weights ON' : 'Tune Weights'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Weights Tuning Panel (Collapsible) */}
      {isCustomizing && (
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Front Office Kinematic Scheme Weight Customizer
              </h3>
            </div>
            <button
              onClick={() => {
                setCustomWeights({
                  deceleration: 40,
                  apex_bend: 15,
                  hip_fluidity: 15,
                  trench_impulse: 15,
                  straight_line: 10,
                  size: 5
                });
              }}
              className="text-xs text-slate-400 hover:text-white underline font-mono"
            >
              Reset to Scheme Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            {/* Deceleration Slider */}
            <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Deceleration (DEI):</span>
                <span className="text-blue-400 font-bold">{customWeights.deceleration}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={customWeights.deceleration}
                onChange={(e) => setCustomWeights({ ...customWeights, deceleration: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Apex Bend Slider */}
            <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Apex Arc Bend (EBI):</span>
                <span className="text-emerald-400 font-bold">{customWeights.apex_bend}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={customWeights.apex_bend}
                onChange={(e) => setCustomWeights({ ...customWeights, apex_bend: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Hip Fluidity Slider */}
            <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Hip Fluidity (FI):</span>
                <span className="text-purple-400 font-bold">{customWeights.hip_fluidity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={customWeights.hip_fluidity}
                onChange={(e) => setCustomWeights({ ...customWeights, hip_fluidity: Number(e.target.value) })}
                className="w-full accent-purple-500"
              />
            </div>

            {/* Trench Impulse Slider */}
            <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Trench Explosiveness (TEI):</span>
                <span className="text-amber-400 font-bold">{customWeights.trench_impulse}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={customWeights.trench_impulse}
                onChange={(e) => setCustomWeights({ ...customWeights, trench_impulse: Number(e.target.value) })}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Straight-Line 40 Speed Slider */}
            <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Straight-Line 40-yd Speed:</span>
                <span className="text-rose-400 font-bold">{customWeights.straight_line}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={customWeights.straight_line}
                onChange={(e) => setCustomWeights({ ...customWeights, straight_line: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>

            {/* Size & Arm Length Slider */}
            <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-300">
                <span>Size / Arm Length:</span>
                <span className="text-cyan-400 font-bold">{customWeights.size}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={customWeights.size}
                onChange={(e) => setCustomWeights({ ...customWeights, size: Number(e.target.value) })}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Scheme Description Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-white mr-2">Philosophy:</span>
          <span className="text-slate-300">{currentScheme.description}</span>
          <div className="text-slate-500 mt-1">
            Coaches & Influences: <span className="text-slate-400">{currentScheme.coordinator_influences.join(', ')}</span>
          </div>
        </div>

        <button
          onClick={handleExportBoard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold transition-all border border-slate-700 self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Scheme Board</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search prospect or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>

        {/* Position & Tier Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Position Selector */}
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 cursor-pointer outline-none"
          >
            <option value="ALL">All Positions</option>
            <option value="WR">Wide Receivers</option>
            <option value="EDGE">EDGE Rushers</option>
            <option value="CB">Cornerbacks</option>
            <option value="OL">Offensive Line</option>
            <option value="DL">Defensive Line</option>
            <option value="RB">Running Backs</option>
            <option value="TE">Tight Ends</option>
          </select>

          {/* Fit Tier Selector */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 cursor-pointer outline-none"
          >
            <option value="ALL">All Fit Tiers</option>
            <option value="ELITE_FIT">Elite Fits (85+)</option>
            <option value="STRONG_FIT">Strong Fits (75-84)</option>
            <option value="SCHEME_MISFIT">Misfits (&lt;65)</option>
          </select>

          {/* Round Selector */}
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 cursor-pointer outline-none"
          >
            <option value="ALL">All Draft Rounds</option>
            <option value="RD1">Round 1 Only</option>
            <option value="DAY2">Day 2 (Rounds 2-3)</option>
            <option value="DAY3">Day 3 / UDFA</option>
          </select>
        </div>
      </div>

      {/* Prospect Leaderboard Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-4">Prospect</th>
                <th className="py-3 px-3 text-center">Pos</th>
                <th className="py-3 px-4 text-center">Draft Cap</th>
                <th className="py-3 px-4 text-center">Scheme Fit Score</th>
                <th className="py-3 px-4">Key Kinematic Metric</th>
                <th className="py-3 px-4">Stopwatch Benchmark</th>
                <th className="py-3 px-4">Tactical Scouting Diagnosis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredResults.slice(0, 100).map((res, index) => {
                const p = res.prospect;
                return (
                  <tr
                    key={p.nfl_id}
                    onClick={() => onSelectProspect(p)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center font-mono text-slate-500 font-bold">
                      {index + 1}
                    </td>

                    {/* Prospect Name & College */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {p.college} • {p.draft_year}
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-blue-400 border border-slate-700">
                        {p.position}
                      </span>
                    </td>

                    {/* Draft Cap */}
                    <td className="py-3 px-4 text-center font-mono text-slate-300">
                      {p.draft_pick ? (
                        <span>
                          R{p.draft_round} <span className="text-slate-500">#{p.draft_pick}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">UDFA</span>
                      )}
                    </td>

                    {/* Scheme Fit Score */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-block">
                        {getTierBadge(res.tier, res.fit_score)}
                      </div>
                    </td>

                    {/* Key Kinematic Driver */}
                    <td className="py-3 px-4 font-mono">
                      {p.kinematics.kin_score !== null ? (
                        <div>
                          <span className="font-bold text-blue-400">
                            {p.kinematics.kin_metric_name}: {p.kinematics.kin_score.toFixed(1)}
                          </span>
                          <div className="text-[10px] text-slate-400">{res.primary_driver}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">Athletic: {p.athletic_score}</span>
                      )}
                    </td>

                    {/* Stopwatch Time */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {currentScheme.category === 'OFFENSE' && p.drills.short_shuttle ? (
                        <span>{p.drills.short_shuttle}s <span className="text-slate-500 text-[10px]">(Shuttle)</span></span>
                      ) : p.drills.three_cone ? (
                        <span>{p.drills.three_cone}s <span className="text-slate-500 text-[10px]">(3-Cone)</span></span>
                      ) : p.drills.forty ? (
                        <span>{p.drills.forty}s <span className="text-slate-500 text-[10px]">(40-yd)</span></span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Scouting Diagnosis */}
                    <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs leading-relaxed">
                      {res.scouting_diagnosis}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredResults.length > 100 && (
          <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-800 bg-slate-950/40">
            Showing top 100 of {filteredResults.length} scheme fits. Use position filters or search to explore further.
          </div>
        )}
      </div>
    </div>
  );
};
