import React from 'react';
import { X, UserPlus, Check, Award, Zap, Activity } from 'lucide-react';
import { Client } from '../types/game';
import { RECRUITABLE_PROSPECTS } from '../engine/gameData';
import { audio } from '../engine/audioEngine';

interface RecruitmentModalProps {
  existingClientIds: string[];
  prospects?: Client[];
  onRecruitClient: (client: Client) => void;
  onClose: () => void;
}

export const RecruitmentModal: React.FC<RecruitmentModalProps> = ({
  existingClientIds,
  prospects = RECRUITABLE_PROSPECTS,
  onRecruitClient,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0e1628] border border-[#223554] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1c2c47] bg-[#121c32] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-white text-base">SCOUT & RECRUIT TALENT</h2>
          </div>
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1c2c47] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          <p className="text-xs text-slate-400 leading-relaxed">
            Pitch the <span className="text-cyan-400 font-semibold">RAID Methodology</span> to high-potential NFL prospects and free agents seeking research-driven representation over generic agent promises.
          </p>

          <div className="space-y-4">
            {prospects.map((prospect) => {
              const alreadySigned = existingClientIds.includes(prospect.id);

              return (
                <div
                  key={prospect.id}
                  className="p-4 rounded-xl bg-[#121c33] border border-[#233554] flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    {prospect.headshotUrl ? (
                      <div className="w-13 h-13 rounded-lg bg-[#182642] border border-cyan-500/30 overflow-hidden shrink-0">
                        <img src={prospect.headshotUrl} alt={prospect.name} className="w-full h-full object-cover object-top" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#182642] border border-cyan-500/30 flex items-center justify-center font-display font-bold text-lg text-cyan-400 shrink-0">
                        {prospect.position}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-white text-base">{prospect.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          OVR {prospect.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        {prospect.teamLogoUrl && <img src={prospect.teamLogoUrl} alt="" className="w-3.5 h-3.5 object-contain" />}
                        <span>{prospect.positionFull} • {prospect.team} • Scheme: {prospect.schemeType}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs hidden sm:block">
                      <div className="text-slate-400 font-mono">FIT SCORE</div>
                      <div className="font-bold text-cyan-400 font-mono">{prospect.schemeFitScore}/100</div>
                    </div>

                    {alreadySigned ? (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>REPRESENTED</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          audio.playDealSigned();
                          onRecruitClient(prospect);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Sign to RAID</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
