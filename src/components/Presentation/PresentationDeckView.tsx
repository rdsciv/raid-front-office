import React, { useState } from 'react';
import { Presentation, Maximize2, ExternalLink, Download, Sparkles, ChevronRight } from 'lucide-react';

export const PresentationDeckView: React.FC = () => {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                COMBINE FINALS STAGE • INDIANAPOLIS
              </span>
              <span className="text-xs text-slate-400">10-Minute Executive Presentation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
              NFL Scouting Combine Presentation Deck
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              10-slide presentation deck formatted for the NFL Big Data Bowl 2027 live finalist evaluation before NFL general managers, analytics directors, and coaching staffs in Indianapolis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="./presentation.html"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Launch Fullscreen Deck</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Presentation Outline Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 text-xs">
          {[
            { num: '01', title: 'The Problem', desc: 'Stopwatch Trap' },
            { num: '02', title: 'Telemetry Engine', desc: '10 Hz Derivatives' },
            { num: '03', title: 'Spatio-Temporal GNN', desc: 'Attention Layer' },
            { num: '04', title: 'Empirical Figures', desc: 'Figures 1–4' },
            { num: '05', title: 'Decision Matrix', desc: 'Sleepers vs Busts' },
            { num: '06', title: 'Case Study: WRs', desc: 'Reed vs TeSlaa' },
            { num: '07', title: 'Case Study: EDGE', desc: 'Foskey vs Van Ness' },
            { num: '08', title: 'Scheme Fit Engine', desc: '32 Franchises' },
            { num: '09', title: '2025 Benchmarks', desc: 'Membou & Grant' },
            { num: '10', title: 'Front Office ROI', desc: 'Draft Value Alpha' },
          ].map((s) => (
            <div key={s.num} className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl">
              <div className="text-[10px] font-mono text-amber-400 font-bold">{s.num}</div>
              <div className="font-bold text-white truncate text-[11px] mt-0.5">{s.title}</div>
              <div className="text-[10px] text-slate-400 truncate">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Presentation Frame */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <Presentation className="w-4 h-4 text-amber-400" />
            <span>Interactive Slide Canvas (Use Keyboard Arrow Keys or Click on Canvas)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-mono">10 Slides • 16:9 Presentation Format</span>
            <a
              href="./presentation.html"
              download="nfl_combine_2027_presentation_deck.html"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-all"
            >
              <Download className="w-3 h-3" />
              <span>HTML Source</span>
            </a>
          </div>
        </div>

        <div className="w-full h-[680px] bg-slate-950">
          <iframe
            src="./presentation.html"
            title="NFL Combine 2027 Finalist Presentation Deck"
            className="w-full h-full border-0"
            onLoad={() => setIframeLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
};
