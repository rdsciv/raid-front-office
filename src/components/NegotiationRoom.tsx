import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  DollarSign, 
  Sparkles, 
  TrendingDown, 
  LogOut, 
  HelpCircle,
  Briefcase,
  Flame,
  ArrowRight,
  Check,
  RefreshCw
} from 'lucide-react';
import { Client, GMProfile, ContractOffer, TacticalMove, GMMood } from '../types/game';
import { TACTICAL_MOVES } from '../engine/gameData';
import { evaluateContractOffer, calculateAcceptanceScore } from '../engine/negotiationEngine';
import { audio } from '../engine/audioEngine';

interface NegotiationRoomProps {
  client: Client;
  gm: GMProfile;
  onClose: () => void;
  onDealCompleted: (client: Client, finalDeal: ContractOffer, commission: number) => void;
  onUpdateClientTrust: (clientId: string, trustDelta: number) => void;
}

interface DialogueEntry {
  id: string;
  sender: 'GM' | 'PLAYER' | 'SYSTEM';
  text: string;
  timestamp: string;
}

export const NegotiationRoom: React.FC<NegotiationRoomProps> = ({
  client,
  gm,
  onClose,
  onDealCompleted,
  onUpdateClientTrust
}) => {
  // Determine Client Situation Tier
  const isJourneyman = client.tier === 'JOURNEYMAN' || client.contractType === 'PROVE_IT' || client.age >= 29;
  const isRookie = client.tier === 'ROOKIE' || client.contractType === 'ROOKIE_SCALE';
  const isStar = !isJourneyman && !isRookie;

  const targetAsk = client.warRoom.targetAsk;

  // Negotiation state
  const [currentGM, setCurrentGM] = useState<GMProfile>({ ...gm });
  const [patience, setPatience] = useState<number>(gm.patience);
  const [acceptanceScore, setAcceptanceScore] = useState<number>(gm.acceptanceScore);
  const [lastGMCounter, setLastGMCounter] = useState<ContractOffer | null>(null);

  const [dialogue, setDialogue] = useState<DialogueEntry[]>([
    {
      id: 'init-gm',
      sender: 'GM',
      text: gm.currentStance,
      timestamp: 'Just now'
    }
  ]);
  const [dealSuccess, setDealSuccess] = useState<boolean>(false);
  const [impasseOccurred, setImpasseOccurred] = useState<boolean>(false);

  // Dynamic Slider Bounds Calculations
  const minTerm = isJourneyman ? 1 : isRookie ? 4 : 3;
  const maxTerm = isJourneyman ? 2 : isRookie ? 4 : 5;

  const minAAV = isRookie
    ? Math.max(1, Math.round((targetAsk.aav - 0.5) * 10) / 10)
    : isJourneyman
    ? Math.max(1.0, Math.round(targetAsk.aav * 0.4 * 10) / 10)
    : Math.round(targetAsk.aav * 0.6 * 10) / 10;

  const maxAAV = isRookie
    ? Math.round((targetAsk.aav + 0.5) * 10) / 10
    : isJourneyman
    ? Math.round(targetAsk.aav * 1.4 * 10) / 10
    : Math.round(targetAsk.aav * 1.35 * 10) / 10;

  const stepAAV = targetAsk.aav < 5 ? 0.1 : 0.25;

  // Contract builder state initialized to Target Ask
  const [term, setTerm] = useState<number>(targetAsk.term);
  const [aav, setAav] = useState<number>(targetAsk.aav);
  const [practicalGuarantees, setPracticalGuarantees] = useState<number>(targetAsk.practicalGuarantees);
  const [cashFlowPct, setCashFlowPct] = useState<number>(
    targetAsk.term === 1 ? 100 : targetAsk.firstYearCashFlowPct
  );
  const [escapeHatch, setEscapeHatch] = useState<boolean>(false);
  const [escalators, setEscalators] = useState<boolean>(true);

  const dialogueEndRef = useRef<HTMLDivElement>(null);

  // Calculated contract terms with safety clamps
  const totalValue = Math.round(term * aav * 10) / 10;

  const minGtd = Math.max(0.5, Math.round(totalValue * (isRookie ? 0.8 : 0.2) * 10) / 10);
  const maxGtd = Math.max(minGtd + 0.5, totalValue);
  const stepGtd = totalValue <= 12 ? 0.25 : 1;

  const safeGuarantees = Math.min(Math.max(practicalGuarantees, minGtd), maxGtd);
  const safeCashFlowPct = term === 1 ? 100 : cashFlowPct;
  const guaranteeRatio = Math.round((safeGuarantees / (totalValue || 1)) * 100);
  const agencyCommission = Math.round(safeGuarantees * 0.03 * 100) / 100;

  // Helper to synchronize GM Mood with realistic thresholds
  const calculateGMMood = (currPatience: number, currAcceptance: number): GMMood => {
    if (currPatience <= 25) return 'Walkout Risk';
    if (currAcceptance >= 68 && currPatience > 35) return 'Ready to Sign';
    if (currPatience <= 45) return 'Defensive';
    if (currAcceptance >= 55) return 'Intrigued';
    if (currAcceptance >= 40) return 'Cornered';
    return 'Skeptical';
  };

  // Live estimated contract offer
  const currentOffer: ContractOffer = {
    term,
    aav,
    totalValue,
    practicalGuarantees: safeGuarantees,
    year1CashFlowPct: safeCashFlowPct,
    lateYearEscapeHatch: escapeHatch,
    incentiveEscalators: escalators
  };

  const estimatedAcceptance = calculateAcceptanceScore(currentOffer, client, {
    ...currentGM,
    acceptanceScore
  });

  useEffect(() => {
    dialogueEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogue]);

  // Handle deploying a RAID Tactical Move
  const handleDeployMove = (move: TacticalMove) => {
    if (patience <= 0 || dealSuccess) return;

    audio.playTacticalStrike();

    // Calculate updated metrics
    const newPatience = Math.max(0, Math.min(100, patience + move.patienceImpact));
    const newAcceptance = Math.min(100, acceptanceScore + move.acceptanceImpact);

    setPatience(newPatience);
    setAcceptanceScore(newAcceptance);

    // Update GM Mood synchronously
    const newMood = calculateGMMood(newPatience, newAcceptance);

    const updatedGM: GMProfile = {
      ...currentGM,
      patience: newPatience,
      acceptanceScore: newAcceptance,
      currentMood: newMood
    };
    setCurrentGM(updatedGM);

    const responseText = move.gmResponse(updatedGM, client);

    setDialogue(prev => [
      ...prev,
      {
        id: `player-${Date.now()}`,
        sender: 'PLAYER',
        text: `[RAID ${move.category} STRATEGY]: ${move.description}`,
        timestamp: 'Just now'
      },
      {
        id: `gm-${Date.now() + 1}`,
        sender: 'GM',
        text: responseText,
        timestamp: 'Just now'
      }
    ]);

    // Check for impasse
    if (newPatience <= 0) {
      audio.playTensionAlert();
      setImpasseOccurred(true);
      setDialogue(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'SYSTEM',
          text: `NEGOTIATION IMPASSE: GM ${currentGM.name} has terminated talks. Negotiations collapsed into the legal tampering window.`,
          timestamp: 'Just now'
        }
      ]);
    }
  };

  // Quick Action: Snap contract sliders to match GM's active counter-offer
  const handleMatchGMCounter = (counter: ContractOffer) => {
    audio.playClick();
    setTerm(counter.term);
    setAav(counter.aav);
    setPracticalGuarantees(counter.practicalGuarantees);
    if (counter.term > 1) {
      setCashFlowPct(counter.year1CashFlowPct);
    }
    setEscapeHatch(counter.lateYearEscapeHatch);
    setEscalators(counter.incentiveEscalators);
  };

  // Handle Submitting a Formal Contract Proposal
  const handleSubmitProposal = () => {
    if (patience <= 0 || dealSuccess) return;

    audio.playClick();

    const evaluation = evaluateContractOffer(
      currentOffer,
      client,
      {
        ...currentGM,
        patience,
        acceptanceScore
      },
      lastGMCounter || undefined
    );

    const newPatience = Math.max(0, Math.min(100, patience + evaluation.patienceDelta));
    setPatience(newPatience);

    onUpdateClientTrust(client.id, evaluation.clientTrustDelta);

    if (evaluation.accepted) {
      audio.playDealSigned();
      setDealSuccess(true);
      setCurrentGM(prev => ({
        ...prev,
        patience: newPatience,
        acceptanceScore: 100,
        currentMood: 'Ready to Sign'
      }));

      setDialogue(prev => [
        ...prev,
        {
          id: `player-offer-${Date.now()}`,
          sender: 'PLAYER',
          text: `[FORMAL OFFER SUBMITTED]: ${term} Years, $${totalValue}M Total ($${aav}M AAV), $${safeGuarantees}M Guaranteed (${guaranteeRatio}%), ${safeCashFlowPct}% Year 1 Cash Flow.`,
          timestamp: 'Just now'
        },
        {
          id: `gm-accept-${Date.now() + 1}`,
          sender: 'GM',
          text: evaluation.gmResponse,
          timestamp: 'Just now'
        },
        {
          id: `sys-deal-${Date.now() + 2}`,
          sender: 'SYSTEM',
          text: `CONTRACT SIGNED: ${client.name} agrees to terms with the ${client.team}! Agency fee secured: $${agencyCommission}M.`,
          timestamp: 'Just now'
        }
      ]);

      setTimeout(() => {
        onDealCompleted(client, currentOffer, agencyCommission);
      }, 2500);

    } else {
      audio.playTensionAlert();
      const newAcceptance = Math.min(95, Math.max(acceptanceScore, evaluation.score));
      setAcceptanceScore(newAcceptance);

      if (evaluation.counterOffer) {
        setLastGMCounter(evaluation.counterOffer);
      }

      // Synchronize GM Mood with updated state
      const newMood = calculateGMMood(newPatience, newAcceptance);
      setCurrentGM(prev => ({
        ...prev,
        patience: newPatience,
        acceptanceScore: newAcceptance,
        currentMood: newMood
      }));

      setDialogue(prev => [
        ...prev,
        {
          id: `player-offer-${Date.now()}`,
          sender: 'PLAYER',
          text: `[SUBMITTED PROPOSAL]: ${term} Yrs / $${aav}M AAV / $${safeGuarantees}M Gtd.`,
          timestamp: 'Just now'
        },
        {
          id: `gm-counter-${Date.now() + 1}`,
          sender: 'GM',
          text: evaluation.gmResponse,
          timestamp: 'Just now'
        }
      ]);

      if (newPatience <= 0) {
        setImpasseOccurred(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070b14]/95 backdrop-blur-md flex flex-col overflow-hidden animate-fadeIn">
      {/* Top War Room HUD */}
      <div className="px-4 py-3 bg-[#0d1527] border-b border-[#1b2b48] flex flex-wrap items-center justify-between gap-4">
        {/* GM Info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#14213d] border border-cyan-500/40 flex items-center justify-center overflow-hidden shrink-0">
            {currentGM.teamLogoUrl ? (
              <img src={currentGM.teamLogoUrl} alt={currentGM.team} className="w-8 h-8 object-contain" />
            ) : (
              <span className="font-display font-bold text-lg text-cyan-400">GM</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-white text-base">{currentGM.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono border border-blue-800 flex items-center gap-1">
                {currentGM.teamLogoUrl && <img src={currentGM.teamLogoUrl} alt="" className="w-3 h-3 object-contain" />}
                <span>{currentGM.team}</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-mono border border-purple-800">
                {currentGM.archetype}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Cap Space: <span className="text-emerald-400 font-mono font-bold">${currentGM.teamCapSpace}M</span></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {client.headshotUrl && <img src={client.headshotUrl} alt="" className="w-4 h-4 rounded-full object-cover" />}
                <span>Target: <span className="text-cyan-400 font-bold">{client.name} ({client.position})</span></span>
              </span>
              <span>•</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 uppercase">
                {isJourneyman ? 'Prove-It Free Agent' : isRookie ? 'Slotted Rookie' : 'Star Extension'}
              </span>
            </p>
          </div>
        </div>

        {/* Dynamic GM Psychological Meters */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
          {/* GM Mood */}
          <div className="px-3 py-1.5 rounded-lg bg-[#101a2e] border border-[#223554] text-center">
            <div className="text-[10px] text-slate-400 uppercase">GM Disposition</div>
            <div className={`font-bold text-xs ${
              currentGM.currentMood === 'Ready to Sign' ? 'text-emerald-400 font-extrabold' :
              currentGM.currentMood === 'Cornered' || currentGM.currentMood === 'Pressured' ? 'text-amber-400' :
              currentGM.currentMood === 'Walkout Risk' ? 'text-rose-400 animate-pulse font-extrabold' :
              'text-cyan-300'
            }`}>
              {currentGM.currentMood}
            </div>
          </div>

          {/* Patience Meter */}
          <div className="w-36 sm:w-44">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>GM PATIENCE</span>
              <span className={`font-bold ${patience <= 25 ? 'text-rose-400 font-extrabold' : 'text-slate-200'}`}>{patience}%</span>
            </div>
            <div className="h-2 w-full bg-[#162138] rounded-full overflow-hidden border border-[#233554]">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  patience <= 25 ? 'bg-rose-500' : patience < 50 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${patience}%` }}
              />
            </div>
          </div>

          {/* Deal Acceptance Probability */}
          <div className="w-36 sm:w-44">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>ACCEPTANCE ODDS</span>
              <span className="text-emerald-400 font-bold">{estimatedAcceptance}%</span>
            </div>
            <div className="h-2 w-full bg-[#162138] rounded-full overflow-hidden border border-[#233554]">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${estimatedAcceptance}%` }}
              />
            </div>
          </div>

          {/* Close / Return Button */}
          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-[#1a2742] transition-colors border border-[#233554]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table Talks</span>
          </button>
        </div>
      </div>

      {/* Main Negotiation Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Live Dialogue & Strategic Action Deck (7 cols) */}
        <div className="lg:col-span-7 flex flex-col border-r border-[#192742] overflow-hidden bg-[#090e1a]">
          {/* Scrollable Dialogue Screen */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {dialogue.map((entry) => (
              <div
                key={entry.id}
                className={`flex flex-col ${
                  entry.sender === 'PLAYER'
                    ? 'items-end'
                    : entry.sender === 'SYSTEM'
                    ? 'items-center'
                    : 'items-start'
                }`}
              >
                {entry.sender === 'SYSTEM' ? (
                  <div className="px-3 py-1.5 rounded-md bg-[#131f38] border border-cyan-500/30 text-cyan-300 font-mono text-xs max-w-lg text-center shadow-md">
                    {entry.text}
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] rounded-xl p-3.5 text-xs shadow-lg ${
                      entry.sender === 'PLAYER'
                        ? 'bg-gradient-to-r from-blue-900/90 to-cyan-950/90 border border-cyan-500/50 text-cyan-100 rounded-tr-none'
                        : 'bg-[#121c32] border border-[#233554] text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] font-mono text-slate-400">
                      <span className="font-bold uppercase tracking-wider">
                        {entry.sender === 'PLAYER' ? 'RAID STRATEGY DESK' : `${currentGM.name} (${currentGM.team})`}
                      </span>
                      <span>{entry.timestamp}</span>
                    </div>
                    <p className="leading-relaxed font-sans text-sm">{entry.text}</p>
                  </div>
                )}
              </div>
            ))}
            <div ref={dialogueEndRef} />
          </div>

          {/* Tactical Moves Deck (RAID Framework) */}
          <div className="p-3 bg-[#0d1527] border-t border-[#1a2947]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>RAID TACTICAL COUNTER DECK</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Deploy arguments to shift GM leverage</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TACTICAL_MOVES.map((move) => (
                <button
                  key={move.id}
                  disabled={patience <= 0 || dealSuccess}
                  onClick={() => handleDeployMove(move)}
                  className="p-2.5 rounded-lg bg-[#121c32] hover:bg-[#192744] active:bg-[#0f182c] border border-[#223554] hover:border-cyan-500/50 text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                    <span>{move.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                      +{move.acceptanceImpact}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-snug">
                    {move.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Real-Time Contract Architecture Builder (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-[#0c1222] overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1b2b48] pb-3">
            <div>
              <h3 className="font-display font-bold text-white text-base">CONTRACT ARCHITECTURE</h3>
              <p className="text-[11px] text-slate-400">
                {isJourneyman ? '1-Year Prove-It / Camp Structure' : isRookie ? '4-Year CBA Slotted Rookie Scale' : 'Multi-Year Premier Veteran Extension'}
              </p>
            </div>
            <div className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-mono text-xs font-bold">
              3% COMM: ${agencyCommission}M
            </div>
          </div>

          {/* Active GM Counter-Offer Quick Match Banner */}
          {lastGMCounter && !dealSuccess && (
            <div className="p-3 rounded-lg bg-[#11203b] border border-cyan-500/40 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">GM Counter On Table</span>
                <span className="text-white font-mono font-bold">
                  {lastGMCounter.term} Yr{lastGMCounter.term > 1 ? 's' : ''} / ${lastGMCounter.aav}M AAV / ${lastGMCounter.practicalGuarantees}M Gtd
                </span>
              </div>
              <button
                onClick={() => handleMatchGMCounter(lastGMCounter)}
                className="px-2.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-semibold font-mono text-xs flex items-center gap-1 shadow transition-all active:scale-95 shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Match GM Offer</span>
              </button>
            </div>
          )}

          {/* Sliders Suite */}
          <div className="space-y-4 text-xs">
            {/* Term Slider / Fixed Display */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">TERM (YEARS):</span>
                <span className="text-white font-bold">
                  {isRookie ? '4 Years (CBA Slotted Rookie Scale)' : `${term} Year${term > 1 ? 's' : ''}`}
                </span>
              </div>
              {isRookie ? (
                <div className="h-2 w-full bg-[#162138] rounded-full overflow-hidden border border-[#233554]">
                  <div className="h-full bg-cyan-400 rounded-full w-full" />
                </div>
              ) : (
                <input
                  type="range"
                  min={minTerm}
                  max={maxTerm}
                  step="1"
                  value={term}
                  onChange={(e) => {
                    setTerm(Number(e.target.value));
                    audio.playClick();
                  }}
                  disabled={dealSuccess}
                  className="w-full h-1.5 bg-[#17233c] rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              )}
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                {isJourneyman ? (
                  <>
                    <span>1 Year (Prove-It / Camp Signing)</span>
                    <span>2 Years (Option Structure)</span>
                  </>
                ) : isRookie ? (
                  <>
                    <span>Slotted 4-Year Fixed Term</span>
                    <span>5th-Year Club Option (Rd 1)</span>
                  </>
                ) : (
                  <>
                    <span>3 Yrs (High Cap Turn)</span>
                    <span>4 Yrs (Market Standard)</span>
                    <span>5 Yrs (Franchise Anchor)</span>
                  </>
                )}
              </div>
            </div>

            {/* AAV Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">AVERAGE ANNUAL VALUE (AAV):</span>
                <span className="text-cyan-400 font-bold">${aav}M / Year</span>
              </div>
              <input
                type="range"
                min={minAAV}
                max={maxAAV}
                step={stepAAV}
                value={aav}
                onChange={(e) => {
                  setAav(Number(e.target.value));
                  audio.playClick();
                }}
                disabled={dealSuccess}
                className="w-full h-1.5 bg-[#17233c] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>${minAAV}M (Discount)</span>
                <span className="text-cyan-400 font-semibold">Target: ${targetAsk.aav}M</span>
                <span>${maxAAV}M (Top Range)</span>
              </div>
            </div>

            {/* Practical Guarantees Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">PRACTICAL GUARANTEES:</span>
                <span className="text-emerald-400 font-bold">${safeGuarantees}M ({guaranteeRatio}%)</span>
              </div>
              <input
                type="range"
                min={minGtd}
                max={maxGtd}
                step={stepGtd}
                value={safeGuarantees}
                onChange={(e) => {
                  setPracticalGuarantees(Number(e.target.value));
                  audio.playClick();
                }}
                disabled={dealSuccess}
                className="w-full h-1.5 bg-[#17233c] rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>${minGtd}M (Base Floor)</span>
                <span className="text-emerald-400 font-semibold">Target: ${targetAsk.practicalGuarantees}M</span>
                <span>${maxGtd}M (Full Security)</span>
              </div>
            </div>

            {/* Year 1 Cash Flow % Slider (or 100% fixed for 1-year deals) */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">YEAR 1 CASH FLOW PAYOUT:</span>
                <span className="text-amber-400 font-bold">
                  {term === 1 ? '100% (Single-Season Payout)' : `${cashFlowPct}%`}
                </span>
              </div>
              {term === 1 ? (
                <div className="h-2 w-full bg-[#162138] rounded-full overflow-hidden border border-[#233554]">
                  <div className="h-full bg-amber-400 rounded-full w-full" />
                </div>
              ) : (
                <input
                  type="range"
                  min="20"
                  max="60"
                  step="1"
                  value={cashFlowPct}
                  onChange={(e) => {
                    setCashFlowPct(Number(e.target.value));
                    audio.playClick();
                  }}
                  disabled={dealSuccess}
                  className="w-full h-1.5 bg-[#17233c] rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              )}
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                {term === 1 ? (
                  <span>Base salary and signing incentives fully paid in 2024</span>
                ) : (
                  <>
                    <span>20% (Deferred Cap)</span>
                    <span className="text-amber-400 font-semibold">Target: {targetAsk.firstYearCashFlowPct}%</span>
                    <span>60% (Upfront Heavy)</span>
                  </>
                )}
              </div>
            </div>

            {/* Contextual Tier-Specific Clauses */}
            <div className="pt-2 space-y-2.5 border-t border-[#1b2b48]">
              {isJourneyman ? (
                <>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={escapeHatch}
                      onChange={(e) => {
                        setEscapeHatch(e.target.checked);
                        audio.playClick();
                      }}
                      disabled={dealSuccess}
                      className="rounded bg-[#162138] border-[#223554] text-cyan-500 focus:ring-0"
                    />
                    <span>Per-Game Active Roster Bonuses ($1.5M split) (+GM Injury Protection)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={escalators}
                      onChange={(e) => {
                        setEscalators(e.target.checked);
                        audio.playClick();
                      }}
                      disabled={dealSuccess}
                      className="rounded bg-[#162138] border-[#223554] text-cyan-500 focus:ring-0"
                    />
                    <span>Add $1.5M Playoff / Pro Bowl Escalators (+Client Trust & Upside)</span>
                  </label>
                </>
              ) : isRookie ? (
                <>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={escapeHatch}
                      onChange={(e) => {
                        setEscapeHatch(e.target.checked);
                        audio.playClick();
                      }}
                      disabled={dealSuccess}
                      className="rounded bg-[#162138] border-[#223554] text-cyan-500 focus:ring-0"
                    />
                    <span>100% Upfront Signing Bonus Payout in 2024 (+Client Trust, -Cap GM)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={escalators}
                      onChange={(e) => {
                        setEscalators(e.target.checked);
                        audio.playClick();
                      }}
                      disabled={dealSuccess}
                      className="rounded bg-[#162138] border-[#223554] text-cyan-500 focus:ring-0"
                    />
                    <span>Zero Club Offset Language (+Elite Agent Precedent & Security)</span>
                  </label>
                </>
              ) : (
                <>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={escapeHatch}
                      onChange={(e) => {
                        setEscapeHatch(e.target.checked);
                        audio.playClick();
                      }}
                      disabled={dealSuccess}
                      className="rounded bg-[#162138] border-[#223554] text-cyan-500 focus:ring-0"
                    />
                    <span>Include Year 4 Club Escape Hatch (+Acceptance with Cap GM)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={escalators}
                      onChange={(e) => {
                        setEscalators(e.target.checked);
                        audio.playClick();
                      }}
                      disabled={dealSuccess}
                      className="rounded bg-[#162138] border-[#223554] text-cyan-500 focus:ring-0"
                    />
                    <span>Add $3M Pro Bowl / Playoff Escalators (+Client Trust & Motivation)</span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Proposal Summary Card */}
          <div className="p-3.5 rounded-xl bg-[#0f172a] border border-[#213150] space-y-1.5 text-xs">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">TOTAL CONTRACT PACKAGE</div>
            <div className="flex justify-between font-mono text-sm">
              <span className="text-slate-300">Total Value:</span>
              <span className="font-bold text-white">${totalValue}M</span>
            </div>
            <div className="flex justify-between font-mono text-sm">
              <span className="text-slate-300">Year 1 Cash:</span>
              <span className="font-bold text-amber-400">
                ${Math.round(totalValue * (safeCashFlowPct / 100) * 10) / 10}M
              </span>
            </div>
            <div className="flex justify-between font-mono text-sm">
              <span className="text-slate-300">Guaranteed Money:</span>
              <span className="font-bold text-emerald-400">${safeGuarantees}M</span>
            </div>
          </div>

          {/* Proposal Action Button */}
          {dealSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-center space-y-2 animate-bounce">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
              <div className="font-display font-bold text-base">DEAL OFFICIALLY SIGNED</div>
              <p className="text-xs">Contract filed with league office. Full commission credited.</p>
            </div>
          ) : impasseOccurred ? (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/80 text-rose-200 text-center space-y-2">
              <AlertTriangle className="w-8 h-8 mx-auto text-rose-400" />
              <div className="font-display font-bold text-base">TALKS COLLAPSED</div>
              <p className="text-xs">GM walked away. Client enters the open market auction.</p>
              <button
                onClick={() => {
                  audio.playClick();
                  onClose();
                }}
                className="mt-2 px-4 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Return to Front Office
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmitProposal}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-display font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Formal Offer to GM</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
