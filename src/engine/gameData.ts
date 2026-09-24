import { Client, GMProfile, OffseasonPhase, NewsItem, TacticalMove } from '../types/game';

export const OFFSEASON_PHASES: OffseasonPhase[] = [
  {
    id: 0,
    name: 'August Training Camp Opening (Holdout & Hold-in Sagas)',
    shortName: 'CAMP OPEN',
    description: 'Vested veterans report. Unhappy superstars stage hold-ins while daily mandatory fines accumulate.',
    daysRemaining: 14,
    isDraft: false
  },
  {
    id: 1,
    name: 'Preseason Week 1 & Joint Practices',
    shortName: 'PRESEASON W1',
    description: 'First live scrimmage snaps against rival teams. Backup vulnerabilities and scheme breakdowns surface.',
    daysRemaining: 7,
    isDraft: false
  },
  {
    id: 2,
    name: 'Preseason Week 2 & Injury Wire',
    shortName: 'PRESEASON W2',
    description: 'Camp attrition hits. Front offices scramble for veteran free agent insurance and contract resolutions.',
    daysRemaining: 7,
    isDraft: false
  },
  {
    id: 3,
    name: 'The 53-Man Cutdown Deadline',
    shortName: 'CUTDOWN DAY',
    description: 'Rosters slashed from 90 to 53 players. Vested veteran guarantees crystallize; bubble players test waivers.',
    daysRemaining: 5,
    isDraft: false
  },
  {
    id: 4,
    name: 'NFL Week 1 Season Kickoff',
    shortName: 'SEASON KICKOFF',
    description: 'Opening kickoff countdown. Final deadline to avoid Week 1 game-check forfeiture and holdout penalties.',
    daysRemaining: 1,
    isDraft: false
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'marcus-vance',
    name: 'Marcus Vance',
    position: 'OT',
    positionFull: 'Offensive Left Tackle',
    age: 25,
    team: 'Carolina Panthers',
    teamLogoAbbr: 'CAR',
    rating: 94,
    healthDurability: 91,
    schemeFitScore: 95,
    schemeType: 'Wide Zone',
    publicLeverageScore: 88,
    patienceAndTrust: 76,
    currentStatus: 'Pending Extension',
    currentSalary: 14.1,
    warRoom: {
      thesisStatement: 'Marcus Vance is not an expenditure—he is the indispensable insurance policy protecting your former #1 overall franchise QB. Consuming Pick 8 on a rookie tackle invites fatal pressure-variance.',
      leverageTimeline: [
        'NOW (Combine): Exclusive negotiating window before legal tampering.',
        '+10 Days: New England & Raiders possess $65M+ cap and zero left tackles.',
        '+45 Days: Carolina owns Pick 8; GM desperately needs to draft scarce EDGE.'
      ],
      replacementCost: {
        draftCapitalCost: 'Consumes Pick 8 (1,400 Draft Value Points), forfeiting elite pass-rush talent.',
        rookieVarianceDelta: '+42% higher pressure-to-sack rate projected with a rookie tackle in Year 1.',
        capOpportunityCost: 'Drafting tackle at #8 costs $6.2M/yr cap plus leaves pass-rush void costing $22M on market.',
        qbPressureDelta: '1 sack allowed in 610 pass-pro snaps vs 7.4 sack average for rookie round 1 tackles.',
        pickWasted: 'Round 1, Pick 8'
      },
      targetAsk: {
        term: 4,
        totalValue: 114,
        aav: 28.5,
        practicalGuarantees: 74,
        firstYearCashFlowPct: 38
      },
      comparables: [
        { player: 'Penei Sewell', team: 'DET', aav: 28.0, guarantees: 85.0, year: 2024 },
        { player: 'Laremy Tunsil', team: 'HOU', aav: 25.0, guarantees: 60.0, year: 2023 },
        { player: 'Andrew Thomas', team: 'NYG', aav: 23.5, guarantees: 67.0, year: 2023 }
      ],
      keyStats: [
        { label: 'Pass Block Win Rate', value: '97.4%', rank: '1st in NFL' },
        { label: 'Sacks Allowed (2025)', value: '1', rank: 'Fewest among LTs' },
        { label: 'Consecutive Starts', value: '48', rank: 'Iron Man' }
      ]
    }
  },
  {
    id: 'darius-cross',
    name: 'Darius "Hawk" Cross',
    position: 'S',
    positionFull: 'Split-Safety / Nickel Hybrid',
    age: 24,
    team: 'Baltimore Ravens',
    teamLogoAbbr: 'BAL',
    rating: 91,
    healthDurability: 89,
    schemeFitScore: 98,
    schemeType: 'Split-Safety',
    publicLeverageScore: 84,
    patienceAndTrust: 80,
    currentStatus: 'Pending Extension',
    currentSalary: 4.8,
    warRoom: {
      thesisStatement: 'Cross solves the post-snap disguise puzzle in two-high safety shells. In modern NFL match-quarters, losing his pre-snap coverage diagnostics forces defensive coordinator scheme collapse.',
      leverageTimeline: [
        'NOW: Ravens front office prioritizing internal young nucleus.',
        'Tag Deadline: Safety franchise tag is a modest $13.8M—risk of team locking him in.',
        'Tampering: Vic Fangio & Kyle Shanahan disciples ready to bid top-tier safety money.'
      ],
      replacementCost: {
        draftCapitalCost: 'Replacing a chess piece safety requires Round 2 capital where hit-rates are sub-35%.',
        rookieVarianceDelta: '+1.8 yards per coverage target allowed with replacement safety tandem.',
        capOpportunityCost: 'Signing a band-aid veteran costs $12M with zero long-term scheme mastery.',
        qbPressureDelta: 'Allows 48.2 passer rating against when lined up in the slot or deep half.',
        pickWasted: 'Round 2, Pick 58'
      },
      targetAsk: {
        term: 4,
        totalValue: 76,
        aav: 19.0,
        practicalGuarantees: 46,
        firstYearCashFlowPct: 40
      },
      comparables: [
        { player: 'Antoine Winfield Jr', team: 'TB', aav: 21.0, guarantees: 45.0, year: 2024 },
        { player: 'Kyle Hamilton', team: 'BAL', aav: 22.0, guarantees: 50.0, year: 2025 },
        { player: 'Minkah Fitzpatrick', team: 'PIT', aav: 18.4, guarantees: 36.0, year: 2022 }
      ],
      keyStats: [
        { label: 'Passer Rating Allowed', value: '48.2', rank: '1st among Safeties' },
        { label: 'Disguise Shell Snaps', value: '540', rank: 'Scheme Cornerstone' },
        { label: 'Tackles for Loss', value: '11', rank: 'Top 3 DB' }
      ]
    }
  },
  {
    id: 'treyton-miller',
    name: 'Treyton "Slash" Miller',
    position: 'RB',
    positionFull: 'Wide-Zone Weapon / Slot RB',
    age: 23,
    team: 'Miami Dolphins',
    teamLogoAbbr: 'MIA',
    rating: 88,
    healthDurability: 74,
    schemeFitScore: 97,
    schemeType: 'Wide Zone',
    publicLeverageScore: 79,
    patienceAndTrust: 68,
    currentStatus: 'Pending Extension',
    currentSalary: 2.1,
    warRoom: {
      thesisStatement: 'Miller is the friction-reducer of this offense: 5.6 yards per carry on outside zone. He needs frontloaded guarantees now before 350-touch physical erosion robs his negotiating leverage.',
      leverageTimeline: [
        'URGENT: RB shelf lives are notoriously short; client trust deteriorates rapidly if stalled.',
        'Market Catalyst: CMC / Saquon contracts prove elite dual-threat weapons deserve premium tier.',
        'Free Agency: If Miami hesitates, Kansas City & Dallas will pay for explosive speed.'
      ],
      replacementCost: {
        draftCapitalCost: 'Day 2 pick required; rookie RBs fail pass-protection diagnostics 44% of rookie snaps.',
        rookieVarianceDelta: 'Miami offense averages 1.4 fewer EPA per drive without Miller on the field.',
        capOpportunityCost: 'Signing committee replacements splits snaps and degrades red-zone conversion.',
        qbPressureDelta: 'Tua Tagovailoa play-action success rate drops from 72% with Miller to 54% without.',
        pickWasted: 'Round 2, Pick 55'
      },
      targetAsk: {
        term: 3,
        totalValue: 42,
        aav: 14.0,
        practicalGuarantees: 28,
        firstYearCashFlowPct: 48
      },
      comparables: [
        { player: 'Christian McCaffrey', team: 'SF', aav: 19.0, guarantees: 24.0, year: 2024 },
        { player: 'Saquon Barkley', team: 'PHI', aav: 12.6, guarantees: 26.0, year: 2024 },
        { player: 'Jonathan Taylor', team: 'IND', aav: 14.0, guarantees: 26.5, year: 2023 }
      ],
      keyStats: [
        { label: 'Yards Per Touch', value: '6.1', rank: '2nd in NFL' },
        { label: 'Breakaway Run Rate (15+ yds)', value: '14.2%', rank: '1st in NFL' },
        { label: 'Receptions as Slot Weapon', value: '54', rank: 'Hybrid Threat' }
      ]
    }
  },
  {
    id: 'colton-brooks',
    name: 'Colton Brooks',
    position: 'C',
    positionFull: 'Power-Gap Center & Guard',
    age: 27,
    team: 'Detroit Lions',
    teamLogoAbbr: 'DET',
    rating: 89,
    healthDurability: 96,
    schemeFitScore: 92,
    schemeType: 'Power Gap',
    publicLeverageScore: 75,
    patienceAndTrust: 85,
    currentStatus: 'Pending Extension',
    currentSalary: 6.2,
    warRoom: {
      thesisStatement: 'Brooks represents championship continuity. In Detroit\'s smashmouth identity, interior line communication eliminates A-gap blitz leaks that cause QB concussions.',
      leverageTimeline: [
        'NOW: Lions in Super Bowl window; GM values culture and continuity over shaving $2M.',
        'Free Agency: Center market is starved; three playoff contenders lack starting centers.',
        'Post-Draft: Drafting a rookie center introduces line communication breakdown in September.'
      ],
      replacementCost: {
        draftCapitalCost: 'Top-tier centers rarely exist outside round 1/2; consumes vital secondary draft capital.',
        rookieVarianceDelta: '+3 miscommunicated protection checks per month with rookie center.',
        capOpportunityCost: 'Veteran center market runs $13M-$15M for past-prime players with high injury rates.',
        qbPressureDelta: 'Allowed zero interior QB hits on play-action rollouts in 2025.',
        pickWasted: 'Round 1, Pick 29'
      },
      targetAsk: {
        term: 3,
        totalValue: 45,
        aav: 15.0,
        practicalGuarantees: 29,
        firstYearCashFlowPct: 42
      },
      comparables: [
        { player: 'Frank Ragnow', team: 'DET', aav: 13.5, guarantees: 25.5, year: 2021 },
        { player: 'Creed Humphrey', team: 'KC', aav: 18.0, guarantees: 35.0, year: 2024 },
        { player: 'Landon Dickerson', team: 'PHI', aav: 21.0, guarantees: 50.0, year: 2024 }
      ],
      keyStats: [
        { label: 'Interior Pressure Rate', value: '1.2%', rank: '2nd in NFL' },
        { label: 'Run Blocking Grade (PFF)', value: '88.4', rank: 'Elite' },
        { label: 'Presnap Line Calls', value: '100%', rank: 'Offensive Brain' }
      ]
    }
  }
];

export const GM_PROFILES: Record<string, GMProfile> = {
  'marcus-vance': {
    id: 'gm-dan-henderson',
    name: 'Dan Henderson',
    team: 'Carolina Panthers',
    archetype: 'Analytics/Value GM',
    philosophy: 'Prioritizes surplus draft value and rookie contract windows; staunchly avoids top-market guarantees on non-QBs.',
    draftPick: 'Round 1, Pick 8',
    teamCapSpace: 46.5,
    patience: 80,
    acceptanceScore: 35,
    currentMood: 'Skeptical',
    currentStance: 'Our baseline is 4 yrs / $88M ($22M AAV) with $44M guaranteed. Pick 8 gives us two 21-year-old tackles on rookie deals. Why should we reset the market?'
  },
  'darius-cross': {
    id: 'gm-martin-stone',
    name: 'Martin Stone',
    team: 'Baltimore Ravens',
    archetype: 'Cap Conservative',
    philosophy: 'Refuses to let any contract jeopardize 3-year cash flow structure; insists on late-year non-guaranteed fluff and team escape hatches.',
    draftPick: 'Round 1, Pick 30',
    teamCapSpace: 24.2,
    patience: 75,
    acceptanceScore: 40,
    currentMood: 'Defensive',
    currentStance: 'We value Hawk, but safeties cannot break the $20M barrier without killing our depth. We have the franchise tag in our pocket at $13.8M.'
  },
  'treyton-miller': {
    id: 'gm-rex-callahan',
    name: 'Rex Callahan',
    team: 'Miami Dolphins',
    archetype: 'Win-Now Aggressor',
    philosophy: 'Owner is demanding a Lombardi Trophy this year. Terrified of offensive drop-off, willing to spend if cash flow can be deferred.',
    draftPick: 'Round 1, Pick 21',
    teamCapSpace: 31.0,
    patience: 65,
    acceptanceScore: 50,
    currentMood: 'Intrigued',
    currentStance: 'We want Miller in Miami for our title run. But 3 years fully guaranteed is rich for an RB who carried 260 touches last year. Give us an escape hatch.'
  },
  'colton-brooks': {
    id: 'gm-hank-miller',
    name: 'Hank Miller',
    team: 'Detroit Lions',
    archetype: 'Win-Now Aggressor',
    philosophy: 'Values offensive line grit and locker room chemistry above pure spreadsheet efficiency, but guards his salary cap threshold tightly.',
    draftPick: 'Round 1, Pick 29',
    teamCapSpace: 28.5,
    patience: 85,
    acceptanceScore: 45,
    currentMood: 'Intrigued',
    currentStance: 'Colton is our heartbeat inside. We\'re ready to give him top 5 center money ($13M AAV), but your $15M ask infringes on our defensive tackle extension.'
  }
};

export const TACTICAL_MOVES: TacticalMove[] = [
  {
    id: 'evidence-replacement',
    title: 'Replacement Cost & Option Value',
    category: 'EVIDENCE',
    description: 'Prove that drafting a replacement burns scarce blue-chip draft capital needed for premier defensive positions.',
    patienceImpact: -8,
    acceptanceImpact: +18,
    dialoguePrompt: 'Walk the GM through the opportunity cost of drafting a replacement instead of retaining your client.',
    gmResponse: (gm, client) => {
      const lastName = client.name.split(' ').pop() || client.name;
      if (gm.archetype === 'Analytics/Value GM') {
        return `${gm.name} adjusts his glasses and frowns at his depth chart. "You're not wrong that burning high draft capital or signing a replacement off the street carries massive variance. ${lastName}'s baseline production is quantifiable... Fine. We can improve the guarantee floor."`;
      }
      return `${gm.name} nods slowly. "You make a fair point about replacement cost. We can't afford a rookie or a street free agent taking 8 weeks to get up to speed when our season is on the line."`;
    }
  },
  {
    id: 'evidence-qb-continuity',
    title: 'Continuity & Scheme Insurance',
    category: 'CONTINUITY',
    description: 'Demonstrate that retaining your client prevents catastrophic blown assignments and protects core team chemistry.',
    patienceImpact: -5,
    acceptanceImpact: +15,
    dialoguePrompt: 'Frame client retention as mandatory insurance against blown assignments and scheme breakdown.',
    gmResponse: (gm, client) => {
      const lastName = client.name.split(' ').pop() || client.name;
      if (gm.archetype === 'Win-Now Aggressor') {
        return `${gm.name} leans forward, visibly stressed. "If our coordinator loses sleep in Week 3 because a backup blew a critical coverage or missed a blitz pickup, my job is on the line. We need ${lastName} locked in."`;
      }
      return `${gm.name} grunts. "Every front office values continuity, but that doesn't mean we write blank checks. Still... having ${lastName}'s veteran communication on the field is hard to dismiss."`;
    }
  },
  {
    id: 'structure-cashflow',
    title: 'Architectural Cash Flow Concession',
    category: 'STRUCTURE',
    description: 'Offer rolling vesting dates or structured roster bonuses to grant the front office immediate cap breathing room.',
    patienceImpact: +12,
    acceptanceImpact: +12,
    dialoguePrompt: 'Restructure the cash flow distribution to grant the team immediate cap breathing room.',
    gmResponse: (gm, client) => {
      if (gm.archetype === 'Cap Conservative') {
        return `${gm.name}'s eyes light up. "Now you're speaking our language. If we shift the cap hit into structured roster bonuses, we can fit ${client.name} into our cash flow model without compromising our in-season emergency reserves."`;
      }
      return `${gm.name} smiles. "The cap flexibility helps us substantially. We can sweeten the guaranteed total if you lock in that cash flow spread."`;
    }
  },
  {
    id: 'leverage-threaten-auction',
    title: 'Leverage Shock: Threaten Open Market Auction',
    category: 'LEVERAGE_CLOCK',
    description: 'Inform the GM that contract talks will pause and you are preparing to field offers from rival contenders.',
    patienceImpact: -25,
    acceptanceImpact: +24,
    dialoguePrompt: 'Tell the front office you are prepared to test the open market where rival contenders are waiting.',
    gmResponse: (gm, client) => {
      const firstName = client.name.split(' ')[0];
      if (gm.patience < 35) {
        return `${gm.name} stands up, slamming his notebook shut. "Don't threaten this front office! If you want to play games on the open market, ${firstName} can test the waters. We will not be extorted!"`;
      }
      return `${gm.name} winces. He knows rival contenders have cap space and glaring needs at ${client.position}. "Let's not get reckless here. Neither of us wants this hitting an open bidding war. Let's look at the numbers again."`;
    }
  },
  {
    id: 'scheme-efficiency',
    title: 'Scheme Fit & Disguise Superiority',
    category: 'EVIDENCE',
    description: 'Highlight that the coaching staff\'s specific playbook relies 100% on your client\'s rare athletic traits.',
    patienceImpact: -6,
    acceptanceImpact: +14,
    dialoguePrompt: 'Show the GM how replacing your client breaks the head coach\'s core blocking or coverage scheme.',
    gmResponse: (gm, client) => {
      const lastName = client.name.split(' ').pop() || client.name;
      return `${gm.name} sighs. "Our coordinator won't stop texting me about this. He insists without ${lastName}, our core package gets cut in half. That holds substantial weight with our staff."`;
    }
  }
];

export const NEWS_BY_PHASE: Record<number, NewsItem[]> = {
  0: [
    {
      id: 'news-0-1',
      phaseId: 0,
      tag: 'LEAK',
      headline: 'Jerry Jones on CeeDee Lamb Holdout: "I Don\'t Have Any Sense of Urgency"',
      detail: 'Cowboys owner causes public firestorm; Lamb responds with cryptic social media post as $50k daily fines pile up.'
    },
    {
      id: 'news-0-2',
      phaseId: 0,
      tag: 'MARKET',
      headline: 'Trent Williams Preseason Holdout Stalls 49ers Offense',
      detail: 'Kyle Shanahan confirms offense struggling in red zone during joint practice reps without Trent anchoring left tackle.'
    },
    {
      id: 'news-0-3',
      phaseId: 0,
      tag: 'CONTRACT',
      headline: 'Haason Reddick Refuses Jets Training Camp Report Date',
      detail: 'Acquired via trade from Philadelphia, Reddick demands a multi-year extension before taking a single snap.'
    }
  ],
  1: [
    {
      id: 'news-1-1',
      phaseId: 1,
      tag: 'MARKET',
      headline: 'Vikings Suffer Crushing Cornerback Camp Injuries in Scrimmage',
      detail: 'Minnesota secondary in emergency scramble; GM Kwesi Adofo-Mensah actively calling veteran free agents.'
    },
    {
      id: 'news-1-2',
      phaseId: 1,
      tag: 'LEAK',
      headline: 'Malik Nabers Dominates Joint Practices with Lions Secondary',
      detail: 'Giants rookie receiver records 3 touchdown catches; front office anxious to finalize contract details.'
    }
  ],
  2: [
    {
      id: 'news-2-1',
      phaseId: 2,
      tag: 'CONTRACT',
      headline: 'Atlanta Falcons Sign All-Pro Safety Justin Simmons to 1-Year Deal',
      detail: 'Terry Fontenot bolsters defense with a late preseason free agent splash to chase the NFC South title.'
    },
    {
      id: 'news-2-2',
      phaseId: 2,
      tag: 'MARKET',
      headline: 'Rookie Tackle Joe Alt Shuts Down Premier Pass Rushers in Preseason Game',
      detail: 'Chargers right tackle allows zero pressures on 22 pass-blocking snaps against starters.'
    }
  ],
  3: [
    {
      id: 'news-3-1',
      phaseId: 3,
      tag: 'MARKET',
      headline: 'NFL 53-Man Cutdown Frenzy: Over 1,100 Players Waived Across 32 Teams',
      detail: 'Vested veterans hit the market with zero waiver restrictions; contenders hunt for backup running backs and edge rushers.'
    },
    {
      id: 'news-3-2',
      phaseId: 3,
      tag: 'CAP',
      headline: 'Roster Vesting Deadline: Vested Veteran Base Salaries Guarantee on Week 1',
      detail: 'Front offices face 4:00 PM deadline to restructure bubble veterans or risk full-season salary guarantees.'
    }
  ],
  4: [
    {
      id: 'news-4-1',
      phaseId: 4,
      tag: 'CONTRACT',
      headline: 'Week 1 Season Kickoff: Blockbuster Extensions Finalized at the 11th Hour',
      detail: 'Star holdouts report as front offices cave to avoid losing starters for opening weekend.'
    }
  ]
};

export const RECRUITABLE_PROSPECTS: Client[] = [
  {
    id: 'jaylen-banks',
    name: 'Jaylen "Predator" Banks',
    position: 'EDGE',
    positionFull: 'Speed Edge Rusher',
    age: 21,
    team: 'Draft Prospect (Projected Top 10)',
    teamLogoAbbr: 'PROS',
    rating: 89,
    healthDurability: 94,
    schemeFitScore: 91,
    schemeType: 'Man Coverage',
    publicLeverageScore: 82,
    patienceAndTrust: 75,
    currentStatus: 'Unrestricted Free Agent',
    currentSalary: 0,
    warRoom: {
      thesisStatement: 'Banks is the most explosive bend-and-dip pass rusher in the draft class. With pass-rush premiums at an all-time high, his rookie slotting guarantees immediate leverage.',
      leverageTimeline: [
        'Combine: Clocked a blazing 4.48 forty-yard dash with 34-inch arm reach.',
        'Top-10 Pick Window: High draft slot yields guaranteed $26M rookie deal.'
      ],
      replacementCost: {
        draftCapitalCost: 'Teams must draft him in the top 10; missing out leaves them paying $25M+ on free agents.',
        rookieVarianceDelta: '14.5% pressure rate in SEC competition against top tier tackles.',
        capOpportunityCost: 'Rookie surplus value of $18M compared to veteran edge contracts.',
        qbPressureDelta: '12.5 sacks in college senior year.',
        pickWasted: 'Top 10 Overall'
      },
      targetAsk: {
        term: 4,
        totalValue: 34,
        aav: 8.5,
        practicalGuarantees: 34,
        firstYearCashFlowPct: 45
      },
      comparables: [
        { player: 'Will Anderson Jr', team: 'HOU', aav: 8.8, guarantees: 35.2, year: 2023 }
      ],
      keyStats: [
        { label: '40-Yard Dash', value: '4.48s', rank: 'Top 2%' },
        { label: 'College Sacks (2025)', value: '12.5', rank: '1st in SEC' },
        { label: 'Pass Rush Win Rate', value: '24.1%', rank: 'Elite' }
      ]
    }
  },
  {
    id: 'kaelen-ortiz',
    name: 'Kaelen Ortiz',
    position: 'WR',
    positionFull: 'Field-Stretching X Receiver',
    age: 26,
    team: 'Free Agent (Ex-Chargers)',
    teamLogoAbbr: 'FA',
    rating: 87,
    healthDurability: 82,
    schemeFitScore: 93,
    schemeType: 'Spread Option',
    publicLeverageScore: 78,
    patienceAndTrust: 70,
    currentStatus: 'Unrestricted Free Agent',
    currentSalary: 11.2,
    warRoom: {
      thesisStatement: 'Ortiz unlocks deep safety shell manipulation. He creates 3.4 yards of separation on vertical routes, demanding safety help that opens up the entire ground game.',
      leverageTimeline: [
        'Wave 1 Free Agency: Teams that struck out on top receivers enter bidding panic.',
        'Speed Premium: High 40-speed receivers consistently command 15-20% market premium.'
      ],
      replacementCost: {
        draftCapitalCost: 'Late round 1 pick required; 50% bust rate on collegiate vertical receivers.',
        rookieVarianceDelta: 'Creates instantaneous deep coverage tilt from defensive coordinators.',
        capOpportunityCost: 'Signing band-aids yields stagnant explosive play generation.',
        qbPressureDelta: '14.8 yards per target on vertical passing concepts.',
        pickWasted: 'Round 1, Pick 24'
      },
      targetAsk: {
        term: 3,
        totalValue: 54,
        aav: 18.0,
        practicalGuarantees: 32,
        firstYearCashFlowPct: 42
      },
      comparables: [
        { player: 'Calvin Ridley', team: 'TEN', aav: 23.0, guarantees: 50.0, year: 2024 },
        { player: 'Christian Kirk', team: 'JAX', aav: 18.0, guarantees: 37.0, year: 2022 }
      ],
      keyStats: [
        { label: 'Yards Per Catch', value: '16.4', rank: '4th in NFL' },
        { label: 'Deep Separation Rate', value: '3.4 yds', rank: 'Elite' },
        { label: 'Touchdowns (2025)', value: '8', rank: 'Top 10 WR' }
      ]
    }
  }
];
