import React, { useState, useMemo } from 'react';
import { CombineProspect } from '../../lib/combineTypes';
import { ProspectModal } from './ProspectModal';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Compass,
  Download,
  Info
} from 'lucide-react';

interface CombineScoutViewProps {
  prospects: CombineProspect[];
}

export const CombineScoutView: React.FC<CombineScoutViewProps> = ({ prospects }) => {
  const [selectedProspect, setSelectedProspect] = useState<CombineProspect | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedConference, setSelectedConference] = useState('ALL');
  const [selectedClass, setSelectedClass] = useState('ALL');

  // Sorting
  const [sortField, setSortField] = useState<keyof CombineProspect | 'athletic_score' | 'forty' | 'kin_score'>('athletic_score');
  const [sortAsc, setSortAsc] = useState(false);

  // Position group definitions
  const offensePositions = ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'G', 'C', 'T', 'FB'];
  const defensePositions = ['DE', 'DT', 'EDGE', 'OLB', 'ILB', 'LB', 'CB', 'S', 'SS', 'FS', 'DB', 'NT'];

  // Unique conferences
  const conferences = useMemo(() => {
    const list = Array.from(new Set(prospects.map(p => p.conference).filter(Boolean)));
    return ['ALL', ...list.sort()];
  }, [prospects]);

  // Filtered dataset
  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCollege = p.college.toLowerCase().includes(q);
        const matchesPos = p.position.toLowerCase().includes(q);
        if (!matchesName && !matchesCollege && !matchesPos) return false;
      }

      // Position
      if (selectedPosition === 'OFFENSE') {
        if (!offensePositions.includes(p.position)) return false;
      } else if (selectedPosition === 'DEFENSE') {
        if (!defensePositions.includes(p.position)) return false;
      } else if (selectedPosition !== 'ALL') {
        if (selectedPosition === 'IOL') {
          if (!['G', 'C', 'IOL'].includes(p.position)) return false;
        } else if (selectedPosition === 'S') {
          if (!['SS', 'FS', 'S'].includes(p.position)) return false;
        } else if (p.position !== selectedPosition && p.combine_position !== selectedPosition) {
          return false;
        }
      }

      // Year
      if (selectedYear !== 'ALL' && p.draft_year.toString() !== selectedYear) {
        return false;
      }

      // Conference
      if (selectedConference !== 'ALL' && p.conference !== selectedConference) {
        return false;
      }

      // Classification
      if (selectedClass === 'SLEEPER' && !p.kinematics.classification.includes('SLEEPER')) return false;
      if (selectedClass === 'BUST' && !p.kinematics.classification.includes('BUST')) return false;
      if (selectedClass === 'ELITE' && !p.kinematics.classification.includes('ELITE')) return false;

      return true;
    });
  }, [prospects, searchQuery, selectedPosition, selectedYear, selectedConference, selectedClass]);

  // Sorted dataset
  const sortedProspects = useMemo(() => {
    return [...filteredProspects].sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortField === 'athletic_score') {
        valA = a.athletic_score;
        valB = b.athletic_score;
      } else if (sortField === 'forty') {
        valA = a.drills.forty ?? 999;
        valB = b.drills.forty ?? 999;
      } else if (sortField === 'kin_score') {
        valA = a.kinematics.kin_score ?? -999;
        valB = b.kinematics.kin_score ?? -999;
      } else if (sortField === 'name') {
        valA = a.name;
        valB = b.name;
      } else if (sortField === 'draft_pick') {
        valA = a.draft_pick ?? 999;
        valB = b.draft_pick ?? 999;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredProspects, sortField, sortAsc]);

  const handleSort = (field: any) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (score >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    if (score >= 40) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Position', 'Draft Year', 'Pick', 'College', 'Athletic Score', '40 Dash', 'Shuttle', '3 Cone', 'Vertical', 'Kinematic Metric', 'Kinematic Score', 'Classification'];
    const rows = sortedProspects.map(p => [
      `"${p.name}"`,
      p.position,
      p.draft_year,
      p.draft_pick ?? '',
      `"${p.college}"`,
      p.athletic_score,
      p.drills.forty ?? '',
      p.drills.short_shuttle ?? '',
      p.drills.three_cone ?? '',
      p.drills.vertical ?? '',
      p.kinematics.kin_metric_name,
      p.kinematics.kin_score ?? '',
      `"${p.kinematics.classification}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `combine_kinematic_scout_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Search & Top Controls */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search prospects by name, college, or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Year Selector */}
            <div className="flex items-center gap-1 bg-gray-950 border border-gray-800 p-1 rounded-xl text-xs">
              {['ALL', '2025', '2024', '2023'].map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    selectedYear === year 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {year === 'ALL' ? 'All Classes' : `'${year.slice(2)}`}
                </button>
              ))}
            </div>

            {/* Conference Dropdown */}
            <select
              value={selectedConference}
              onChange={(e) => setSelectedConference(e.target.value)}
              className="bg-gray-950 border border-gray-800 text-gray-300 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-blue-500"
            >
              {conferences.map(conf => (
                <option key={conf} value={conf}>
                  {conf === 'ALL' ? 'All Conferences' : conf}
                </option>
              ))}
            </select>

            {/* Export CSV */}
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* Position Filter Pills (Box Score Scout Style) */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-800/80">
          {[
            { id: 'ALL', label: 'All Positions' },
            { id: 'OFFENSE', label: 'Offense' },
            { id: 'DEFENSE', label: 'Defense' },
            { id: 'QB', label: 'QB' },
            { id: 'RB', label: 'RB' },
            { id: 'WR', label: 'WR' },
            { id: 'TE', label: 'TE' },
            { id: 'OT', label: 'OT' },
            { id: 'IOL', label: 'IOL' },
            { id: 'EDGE', label: 'EDGE' },
            { id: 'DT', label: 'DT' },
            { id: 'LB', label: 'LB' },
            { id: 'CB', label: 'CB' },
            { id: 'S', label: 'Safety' },
          ].map(pos => (
            <button
              key={pos.id}
              onClick={() => setSelectedPosition(pos.id)}
              className={`px-3 py-1 text-xs rounded-lg font-bold transition-all ${
                selectedPosition === pos.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800 hover:border-gray-700'
              }`}
            >
              {pos.label}
            </button>
          ))}
        </div>

        {/* Front-Office Strategy / Classification Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Alpha Strategy:
          </span>
          {[
            { id: 'ALL', label: 'All Profiles' },
            { id: 'SLEEPER', label: '💎 Hidden Sleepers' },
            { id: 'BUST', label: '🚨 Bust Risk Traps' },
            { id: 'ELITE', label: '⭐ Elite Consensus' },
          ].map(cls => (
            <button
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all ${
                selectedClass === cls.id 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'bg-gray-800/60 text-gray-400 hover:text-white border border-gray-700/60'
              }`}
            >
              {cls.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="text-[11px] text-gray-400 font-semibold uppercase">Matching Prospects</div>
          <div className="text-2xl font-black text-white mt-1">{filteredProspects.length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="text-[11px] text-gray-400 font-semibold uppercase">Hidden Sleepers</div>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {filteredProspects.filter(p => p.kinematics.classification.includes('SLEEPER')).length}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="text-[11px] text-gray-400 font-semibold uppercase">Bust Risk Traps</div>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {filteredProspects.filter(p => p.kinematics.classification.includes('BUST')).length}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl">
          <div className="text-[11px] text-gray-400 font-semibold uppercase">Avg 40-Yard Dash</div>
          <div className="text-2xl font-black text-purple-400 mt-1">
            {(
              filteredProspects.reduce((acc, p) => acc + (p.drills.forty || 0), 0) /
              (filteredProspects.filter(p => p.drills.forty).length || 1)
            ).toFixed(2)}s
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-950/80 border-b border-gray-800 text-gray-400 font-semibold uppercase tracking-wider">
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Prospect {sortField === 'name' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th className="py-3 px-3">Pos</th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('draft_pick')}
                >
                  <div className="flex items-center gap-1">
                    Pick {sortField === 'draft_pick' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th className="py-3 px-3">Height / Wt</th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                  onClick={() => handleSort('athletic_score')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Athletic Score {sortField === 'athletic_score' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                  onClick={() => handleSort('forty')}
                >
                  <div className="flex items-center justify-center gap-1">
                    40-yd {sortField === 'forty' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th className="py-3 px-3 text-center">10y / Shuttle</th>
                <th className="py-3 px-3 text-center">Vertical / Broad</th>
                <th 
                  className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center"
                  onClick={() => handleSort('kin_score')}
                >
                  <div className="flex items-center justify-center gap-1">
                    10 Hz Kinematics {sortField === 'kin_score' && (sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {sortedProspects.slice(0, 100).map((prospect) => {
                const isSleeper = prospect.kinematics.classification.includes('SLEEPER');
                const isBust = prospect.kinematics.classification.includes('BUST');

                return (
                  <tr 
                    key={prospect.nfl_id}
                    onClick={() => setSelectedProspect(prospect)}
                    className="hover:bg-gray-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Name & College */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        {prospect.name}
                        {prospect.career.pro_bowl > 0 && (
                          <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.2 rounded font-bold">PB</span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {prospect.college} • Class of '{prospect.draft_year.toString().slice(2)}
                      </div>
                    </td>

                    {/* Position */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-900/30 text-blue-400 border border-blue-800/40">
                        {prospect.position}
                      </span>
                    </td>

                    {/* Draft Pick */}
                    <td className="py-3 px-3 font-mono text-gray-300">
                      {prospect.draft_pick ? `#${prospect.draft_pick}` : 'UDFA'}
                    </td>

                    {/* Height / Weight */}
                    <td className="py-3 px-3 text-gray-300">
                      <div>{prospect.measurements.height_formatted}</div>
                      <div className="text-[11px] text-gray-400">{prospect.measurements.weight_lbs} lbs</div>
                    </td>

                    {/* Athletic Score */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-lg border font-mono font-bold text-xs ${getScoreBadge(prospect.athletic_score)}`}>
                        {prospect.athletic_score}
                      </span>
                    </td>

                    {/* 40-yd Dash */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-gray-200">
                      {prospect.drills.forty ? (
                        <div>
                          <span>{prospect.drills.forty.toFixed(2)}s</span>
                          {prospect.drills.pct_forty !== null && (
                            <div className="text-[10px] text-gray-400 font-normal">
                              {prospect.drills.pct_forty.toFixed(0)}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* 10y / Shuttle */}
                    <td className="py-3 px-3 text-center font-mono text-gray-300">
                      <div>10y: {prospect.drills.ten_yd_split ? `${prospect.drills.ten_yd_split.toFixed(2)}s` : '—'}</div>
                      <div className="text-[11px] text-gray-400">Shuttle: {prospect.drills.short_shuttle ? `${prospect.drills.short_shuttle.toFixed(2)}s` : '—'}</div>
                    </td>

                    {/* Vertical / Broad */}
                    <td className="py-3 px-3 text-center font-mono text-gray-300">
                      <div>Vert: {prospect.drills.vertical ? `${prospect.drills.vertical}"` : '—'}</div>
                      <div className="text-[11px] text-gray-400">Broad: {prospect.drills.broad_jump ? `${prospect.drills.broad_jump}"` : '—'}</div>
                    </td>

                    {/* 10 Hz Kinematics */}
                    <td className="py-3 px-3 text-center">
                      {prospect.kinematics.kin_score !== null ? (
                        <div className="font-mono">
                          <span className="font-bold text-blue-400">{prospect.kinematics.kin_score}</span>
                          <div className="text-[10px] text-gray-400">{prospect.kinematics.kin_metric_name}</div>
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Classification */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                        isSleeper ? 'bg-blue-900/30 text-blue-300 border-blue-500/40' :
                        isBust ? 'bg-rose-900/30 text-rose-300 border-rose-500/40' :
                        prospect.kinematics.classification.includes('ELITE') ? 'bg-emerald-900/30 text-emerald-300 border-emerald-500/40' :
                        'bg-gray-800 text-gray-400 border-gray-700'
                      }`}>
                        {prospect.kinematics.classification}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {sortedProspects.length > 100 && (
          <div className="p-3 text-center text-xs text-gray-500 border-t border-gray-800 bg-gray-950/40">
            Showing top 100 of {sortedProspects.length} matching prospects. Use search or position filters to narrow results.
          </div>
        )}
      </div>

      {/* Prospect Modal */}
      <ProspectModal 
        prospect={selectedProspect}
        onClose={() => setSelectedProspect(null)}
        onSelectComp={(compName) => {
          const match = prospects.find(p => p.name.toLowerCase() === compName.toLowerCase());
          if (match) setSelectedProspect(match);
        }}
      />
    </div>
  );
};
