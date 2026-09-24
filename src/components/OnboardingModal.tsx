import React, { useState } from 'react';
import { 
  Shield, 
  Target, 
  TrendingUp, 
  DollarSign, 
  HeartHandshake, 
  Star, 
  Wrench, 
  Zap, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Award, 
  CheckCircle2, 
  Clock, 
  Scale
} from 'lucide-react';
import { audio } from '../engine/audioEngine';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(0);

  if (!isOpen) return null;

  const totalSteps = 4;

  const handleNext = () => {
    audio.playClick();
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      audio.playDealSigned();
      onClose();
    }
  };

  const handlePrev = () => {
    audio.playClick();
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#0b111e] border border-[#233554] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col relative">
        {/* Top Accent Line */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1b2b48] bg-[#0e1628] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-display font-black text-sm">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-white text-sm tracking-wider">RAID STRATEGY DESK</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800">
                  MISSION BRIEFING
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Executive orientation & campaign operational guidelines</p>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#1b2b48] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 min-h-[420px] flex flex-col justify-between">
          {/* STEP 0: Welcome & The Preseason Setting */}
          {step === 0 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>TIMELINE: AUGUST 2024 • START OF NFL PRESEASON</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white leading-tight">
                Welcome to the Hot Seat, <span className="text-cyan-400">Lead Strategist</span>.
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                You have taken command of **RAID**—a high-leverage sports representation agency specializing in deep evidence-based valuation, roster continuity modeling, and contract architecture over hollow sticker numbers.
              </p>

              <div className="p-4 rounded-xl bg-[#121c32] border border-[#223554] space-y-2.5">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span>⚡</span> THE PRESEASON PRESSURE COOKER
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Training camp is in full swing. Star players are accumulating <span className="text-white font-semibold">$50,000 daily un-waivable fines</span> in holdout hotels, journeymen veterans are racing against the 53-man cutdown deadline, and top draft picks are battling front offices over upfront signing bonus cash flow.
                </p>
              </div>

              <p className="text-xs text-slate-400 italic">
                Front offices rely on fear and rookie replacement narratives to suppress player compensation. Your job is to wield data, replacement cost models, and structural precision to force GMs to pay.
              </p>
            </div>
          )}

          {/* STEP 1: The 4 Core Agency Goals */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-mono">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>CAMPAIGN DIRECTIVES</span>
              </div>

              <h2 className="text-2xl font-display font-bold text-white">
                Your 4 Strategic Agency Goals
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-[#121c32] border border-[#223554]">
                  <div className="flex items-center gap-2 text-emerald-400 font-display font-bold text-sm mb-1">
                    <Shield className="w-4 h-4" />
                    <span>1. Maximize Practical Guarantees</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hollow sticker AAV doesn't pay bills when players are cut in Year 3. Secure fully guaranteed base salaries, upfront signing bonus cash, and rolling roster vesting dates.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121c32] border border-[#223554]">
                  <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-sm mb-1">
                    <Award className="w-4 h-4" />
                    <span>2. Reach Hall of Fame Reputation (90+)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Grow agency prestige from 78 to 90+ by winning contract standoffs without letting negotiations collapse into catastrophic holdout estrangement.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121c32] border border-[#223554]">
                  <div className="flex items-center gap-2 text-cyan-400 font-display font-bold text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span>3. Earn 3% Agency Commission</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The agency collects a 3% fee on all guaranteed dollars negotiated. Close mega-extensions and prove-it deals to build your agency's cash reserves.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121c32] border border-[#223554]">
                  <div className="flex items-center gap-2 text-purple-400 font-display font-bold text-sm mb-1">
                    <HeartHandshake className="w-4 h-4" />
                    <span>4. Protect Client Morale & Health</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Clients have finite patience. Lowballing or dragging out holdouts tanks their trust. Deliver contracts before injuries or frustration destroy the relationship.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: The 3 Client Tiers */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 text-xs font-mono">
                <Scale className="w-3.5 h-3.5 text-purple-400" />
                <span>ROSTER DIVERSITY</span>
              </div>

              <h2 className="text-2xl font-display font-bold text-white">
                Mastering the 3 Client Tiers
              </h2>
              <p className="text-xs text-slate-300">
                Your portfolio contains 8 real NFL clients across three completely distinct strategic situations:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#121c32] border-l-4 border-l-amber-400 border border-[#223554] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-950/80 border border-amber-700/60 flex items-center justify-center shrink-0 text-amber-400">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-white text-sm">⭐ The Stars</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">CeeDee Lamb • Trent Williams • Haason Reddick</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      <span className="text-amber-300 font-semibold">The Situation:</span> Training camp holdouts and hold-ins incurring $50k daily fines. Super Bowl contenders are paralyzed without them. Demand market-resetting guarantees ($30M+ AAV).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121c32] border-l-4 border-l-cyan-400 border border-[#223554] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center shrink-0 text-cyan-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-white text-sm">🛠️ The Journeymen</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Justin Simmons • Stephon Gilmore • Samaje Perine</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      <span className="text-cyan-300 font-semibold">The Situation:</span> Cap casualties and emergency injury replacements. Secure 1-year prove-it deals with high practical guarantees and per-game active roster bonuses before cutdown day.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121c32] border-l-4 border-l-emerald-400 border border-[#223554] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center shrink-0 text-emerald-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-white text-sm">⚡ The Rookies</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Malik Nabers • Joe Alt</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      <span className="text-emerald-300 font-semibold">The Situation:</span> CBA rookie wage scales fix the total money ($29M–$33M), but the battle is over **100% upfront signing bonus payment dates** and the elimination of club **offset language**.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: The RAID Methodology & Launch */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>THE RAID METHODOLOGY</span>
              </div>

              <h2 className="text-2xl font-display font-bold text-white">
                How to Break GM Objections
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed">
                When you enter the Negotiation Room against GMs like **Jerry Jones**, **John Lynch**, or **Joe Douglas**, use the RAID action deck:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#0c1424] border border-[#1b2b48]">
                  <span className="text-rose-400 font-mono font-bold block mb-0.5">REPLACEMENT COST</span>
                  <span className="text-slate-300">Prove that letting your client sit burns first-round draft capital needed for scarce edge or corner depth.</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0c1424] border border-[#1b2b48]">
                  <span className="text-cyan-400 font-mono font-bold block mb-0.5">QB CONTINUITY INSURANCE</span>
                  <span className="text-slate-300">Show how backup tackle or receiver variance exposes their franchise QB to career-altering pressure rates.</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0c1424] border border-[#1b2b48]">
                  <span className="text-emerald-400 font-mono font-bold block mb-0.5">CASH FLOW CONCESSIONS</span>
                  <span className="text-slate-300">Restructure signing bonus distributions to grant teams Year 1 cap breathing room in exchange for higher practical guarantees.</span>
                </div>

                <div className="p-3 rounded-lg bg-[#0c1424] border border-[#1b2b48]">
                  <span className="text-amber-400 font-mono font-bold block mb-0.5">LEVERAGE SHOCK</span>
                  <span className="text-slate-300">Threaten the open market auction where rival teams with $50M+ in surplus cap space will gladly bid.</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-500/40 text-center space-y-1">
                <div className="font-display font-bold text-white text-base">You are fully equipped, Director.</div>
                <p className="text-xs text-cyan-300">Protect the players. Master the clock. Reset the market.</p>
              </div>
            </div>
          )}

          {/* Footer Controls & Progress */}
          <div className="pt-6 border-t border-[#1b2b48] flex items-center justify-between gap-4">
            {/* Progress Dots */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    audio.playClick();
                    setStep(idx);
                  }}
                  className={`h-2 rounded-full cursor-pointer transition-all ${
                    idx === step ? 'w-8 bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.6)]' : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            {/* Next / Back Buttons */}
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#142038] hover:bg-[#1a2b4b] border border-[#233554] text-slate-300 text-xs font-semibold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
              >
                <span>{step === totalSteps - 1 ? 'Launch Strategy Desk' : 'Next Directive'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
