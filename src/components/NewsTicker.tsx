import React from 'react';
import { Radio, AlertCircle } from 'lucide-react';
import { NewsItem } from '../types/game';

interface NewsTickerProps {
  news: NewsItem[];
}

export const NewsTicker: React.FC<NewsTickerProps> = ({ news }) => {
  if (!news || news.length === 0) return null;

  return (
    <div className="bg-[#080d17] border-b border-[#182338] px-4 py-2 flex items-center gap-3 overflow-hidden text-xs">
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-700/60 text-rose-300 font-mono font-bold text-[10px] tracking-wider shrink-0 animate-pulse">
        <Radio className="w-3 h-3 text-rose-400" />
        <span>LEAGUE WIRE</span>
      </div>

      <div className="flex items-center gap-8 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
        {news.map((item) => (
          <div key={item.id} className="flex items-center gap-2 text-slate-300">
            <span
              className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold ${
                item.tag === 'CAP'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                  : item.tag === 'MARKET'
                  ? 'bg-blue-950/80 text-blue-400 border border-blue-800'
                  : item.tag === 'LEAK'
                  ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                  : 'bg-purple-950/80 text-purple-400 border border-purple-800'
              }`}
            >
              [{item.tag}]
            </span>
            <span className="font-semibold text-slate-100">{item.headline}:</span>
            <span className="text-slate-400 text-[11px]">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
