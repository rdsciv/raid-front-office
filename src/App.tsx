import React, { useState } from 'react';
import { Header } from './components/Header';
import { NewsTicker } from './components/NewsTicker';
import { PortfolioView } from './components/PortfolioView';
import { WarRoomModal } from './components/WarRoomModal';
import { NegotiationRoom } from './components/NegotiationRoom';
import { RecruitmentModal } from './components/RecruitmentModal';
import { OffseasonSummaryModal } from './components/OffseasonSummaryModal';
import { OnboardingModal } from './components/OnboardingModal';
import { 
  OFFSEASON_PHASES, 
  NEWS_BY_PHASE 
} from './engine/gameData';
import { 
  REAL_NFL_CLIENTS, 
  REAL_GM_PROFILES, 
  REAL_SCOUTING_PROSPECTS 
} from './data/realNflData';
import { Client, ContractOffer, AgencyStats } from './types/game';
import { audio } from './engine/audioEngine';

export const App: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(REAL_NFL_CLIENTS);
  const [phaseIndex, setPhaseIndex] = useState<number>(0);
  const [stats, setStats] = useState<AgencyStats>({
    reputation: 84,
    activeClientsCount: REAL_NFL_CLIENTS.length,
    commissionRevenue: 0.0,
    completedDeals: 0,
    currentPhaseIndex: 0
  });

  const [activeWarRoomClient, setActiveWarRoomClient] = useState<Client | null>(null);
  const [activeNegotiationClient, setActiveNegotiationClient] = useState<Client | null>(null);
  const [isRecruitmentOpen, setIsRecruitmentOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const currentPhase = OFFSEASON_PHASES[phaseIndex];
  const currentNews = NEWS_BY_PHASE[phaseIndex] || [];

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  // Advance Calendar Week / Phase
  const handleAdvancePhase = () => {
    if (phaseIndex < OFFSEASON_PHASES.length - 1) {
      const nextIndex = phaseIndex + 1;
      audio.playPhaseAdvance();
      setPhaseIndex(nextIndex);
      setStats(prev => ({
        ...prev,
        currentPhaseIndex: nextIndex
      }));

      // Unsigned clients experience mild patience drain as clock ticks
      setClients(prevClients =>
        prevClients.map(c => {
          if (c.currentStatus !== 'Signed') {
            const newTrust = Math.max(20, c.patienceAndTrust - 4);
            const newLeverage = Math.min(99, c.publicLeverageScore + 2); // Market urgency increases leverage
            return {
              ...c,
              patienceAndTrust: newTrust,
              publicLeverageScore: newLeverage
            };
          }
          return c;
        })
      );
    } else {
      audio.playDealSigned();
      setIsSummaryOpen(true);
    }
  };

  // Open War Room
  const handleOpenWarRoom = (client: Client) => {
    setActiveWarRoomClient(client);
  };

  // Open Negotiation Battle
  const handleOpenNegotiation = (client: Client) => {
    setActiveWarRoomClient(null);
    setActiveNegotiationClient(client);
  };

  // Deal Completed Success Handler
  const handleDealCompleted = (client: Client, finalDeal: ContractOffer, commission: number) => {
    setClients(prevClients =>
      prevClients.map(c => {
        if (c.id === client.id) {
          return {
            ...c,
            currentStatus: 'Signed',
            signedContract: finalDeal,
            patienceAndTrust: Math.min(100, c.patienceAndTrust + 15)
          };
        }
        return c;
      })
    );

    setStats(prev => ({
      ...prev,
      reputation: Math.min(100, prev.reputation + 6),
      commissionRevenue: prev.commissionRevenue + commission,
      completedDeals: prev.completedDeals + 1
    }));

    setActiveNegotiationClient(null);
  };

  // Update Client Trust
  const handleUpdateClientTrust = (clientId: string, trustDelta: number) => {
    setClients(prevClients =>
      prevClients.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            patienceAndTrust: Math.max(10, Math.min(100, c.patienceAndTrust + trustDelta))
          };
        }
        return c;
      })
    );
  };

  // Recruit New Prospect
  const handleRecruitClient = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    setStats(prev => ({
      ...prev,
      activeClientsCount: prev.activeClientsCount + 1,
      reputation: Math.min(100, prev.reputation + 3)
    }));
    setIsRecruitmentOpen(false);
  };

  // Restart Offseason Campaign
  const handleRestart = () => {
    setClients(REAL_NFL_CLIENTS);
    setPhaseIndex(0);
    setStats({
      reputation: 84,
      activeClientsCount: REAL_NFL_CLIENTS.length,
      commissionRevenue: 0.0,
      completedDeals: 0,
      currentPhaseIndex: 0
    });
    setIsSummaryOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Telemetry Header */}
      <Header
        stats={stats}
        currentPhase={currentPhase}
        totalPhases={OFFSEASON_PHASES.length}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onAdvancePhase={handleAdvancePhase}
        onOpenRecruitment={() => setIsRecruitmentOpen(true)}
        onOpenBriefing={() => setIsOnboardingOpen(true)}
      />

      {/* Breaking News Ticker */}
      <NewsTicker news={currentNews} />

      {/* Main Agency Client Portfolio View */}
      <main className="flex-1">
        <PortfolioView
          clients={clients}
          onOpenWarRoom={handleOpenWarRoom}
          onOpenNegotiation={handleOpenNegotiation}
          onOpenRecruitment={() => setIsRecruitmentOpen(true)}
        />
      </main>

      {/* Interactive Agency Onboarding Briefing Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Evidence War Room Modal */}
      {activeWarRoomClient && (
        <WarRoomModal
          client={activeWarRoomClient}
          onClose={() => setActiveWarRoomClient(null)}
          onEnterNegotiation={handleOpenNegotiation}
        />
      )}

      {/* Live Turn-Based GM Negotiation Room */}
      {activeNegotiationClient && (
        <NegotiationRoom
          client={activeNegotiationClient}
          gm={REAL_GM_PROFILES[activeNegotiationClient.id] || {
            id: 'gm-standard',
            name: `${activeNegotiationClient.team} Front Office`,
            team: activeNegotiationClient.team,
            teamLogoUrl: activeNegotiationClient.teamLogoUrl,
            archetype: 'Analytics/Value GM',
            philosophy: 'Disciplined valuation model based on replacement cost and cap flexibility.',
            draftPick: 'Round 1, Pick 18',
            teamCapSpace: 35.0,
            patience: 75,
            acceptanceScore: 40,
            currentMood: 'Skeptical',
            currentStance: 'We want to keep our core intact, but your numbers exceed our allocated tier budget.'
          }}
          onClose={() => setActiveNegotiationClient(null)}
          onDealCompleted={handleDealCompleted}
          onUpdateClientTrust={handleUpdateClientTrust}
        />
      )}

      {/* Recruitment Modal */}
      {isRecruitmentOpen && (
        <RecruitmentModal
          existingClientIds={clients.map(c => c.id)}
          prospects={REAL_SCOUTING_PROSPECTS}
          onRecruitClient={handleRecruitClient}
          onClose={() => setIsRecruitmentOpen(false)}
        />
      )}

      {/* Offseason Summary Review Modal */}
      {isSummaryOpen && (
        <OffseasonSummaryModal
          stats={stats}
          clients={clients}
          onRestart={handleRestart}
          onClose={() => setIsSummaryOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#162238] bg-[#090f1d] py-4 text-center text-xs text-slate-500 font-mono">
        RAID: FRONT OFFICE // SPORTS REPRESENTATION & HIGH-LEVERAGE CONTRACT SIMULATION
      </footer>
    </div>
  );
};
