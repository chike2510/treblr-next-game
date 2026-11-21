'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  applyOpportunityEffects,
  addClockMinutes,
  BOUTIQUE_ITEMS,
  canTransitionSong,
  CAMPAIGN_PLANS,
  clockMinutes,
  LAGOS_PLACES,
  localRoute,
  migrateSaveData,
  opportunityBlockReason,
  resolveRelease,
  socialPostRequirements,
  shouldExpireOpportunity,
  simulateDailyStreams,
  type CampaignTier,
  type Opportunity,
  type LagosPlaceId,
  type LocalTravelMode,
  type Song,
  type SongStatus,
} from './game-rules';
import {
  CAMPAIGN_CHANNELS, TRAINING_COSTS, awardDecision, buildAwards, canAcceptIndustryOffer,
  dailyCareerWork, makeIndustryOffers, campaignPlan, resolveCampaign, eligibleAward, careerWorkOutcome,
  type CampaignChannel, type SongCampaign, type AlbumProject, type IndustryOffer,
  type AwardRecord, type CareerWork, type TrainingRecord, type TrainingSkill,
} from './career-rules';

export type { CampaignTier, Opportunity, Song, SongStatus } from './game-rules';
export type { CampaignChannel, SongCampaign, AlbumProject, IndustryOffer, AwardRecord, CareerWork, TrainingRecord, TrainingSkill } from './career-rules';
export type LedgerEntry = { id: string; day: number; description: string; amount: number; balanceAfter: number; bucket: 'cash' | 'bank' };
export type HistoryEntry = { id: string; day: number; time: string; title: string; detail: string };
export type RelationshipChoice = 'reply' | 'accept-session' | 'decline' | 'help';
export type NightMood = 'low-key' | 'social' | 'high-energy';
export type EventNightPlan = {
  eventId: 'festival'; stage: 'shared' | 'arrived' | 'attended' | 'recorded'; people: string[]; mood: NightMood; budget: number; day: number; sharedAt: string;
  ride?: { mode: LocalTravelMode; fare: number; minutes: number; from: string; arrivalTime: string };
  ticketId?: string; memoryId?: string;
};
export type EventPass = { id: string; eventId: 'festival'; eventTitle: string; passType: 'Artist pass'; venue: string; day: number; time: string; entryCost: number; rideMode?: LocalTravelMode; simulationOnly: true };
export type MemoryRecord = { id: string; passId: string; eventId: 'festival'; title: string; location: string; day: number; time: string; people: string[]; mood?: NightMood; note: string };
type IdeaDraft = { title: string; genre: string; mood: string; bpm: number; inspiration: string };

type PersistentState = {
  artist: { name: string; handle: string; origin: string; genre: string };
  money: number;
  bank: number;
  fans: number;
  monthlyListeners: number;
  hype: number;
  energy: number;
  mood: number;
  creativity: number;
  reputation: number;
  currentCity: string;
  currentLocation: string;
  day: number;
  time: string;
  weather: string;
  songs: Song[];
  relationships: { name: string; role: string; trust: number; note: string; avatar: string }[];
  wardrobe: string[];
  equippedLook: string;
  notifications: string[];
  opportunities: Opportunity[];
  posts: { platform: string; text: string; likes: number; time: string; mode?: string }[];
  ledger: LedgerEntry[];
  history: HistoryEntry[];
  eventNight: EventNightPlan | null;
  passes: EventPass[];
  memories: MemoryRecord[];
  chapterStage: string;
  lastEvent: string;
  cityDemand: Record<string, number>;
  songCampaigns: SongCampaign[];
  albumProjects: AlbumProject[];
  industryInbox: IndustryOffer[];
  awards: AwardRecord[];
  awardsHistory: AwardRecord[];
  careerWork: CareerWork[];
  trainingHistory: TrainingRecord[];
  skills: Record<TrainingSkill, number>;
};

export type GameState = PersistentState & {
  sleep: () => void;
  advanceDay: () => void;
  eat: () => void;
  travel: (city: string) => void;
  travelLocally: (place: LagosPlaceId, mode: LocalTravelMode) => void;
  shareEventPlan: (plan: { people: string[]; mood: NightMood; budget: number }) => void;
  saveEventMemory: (note: string) => void;
  buyBoutiqueItem: (id: string) => void;
  createIdea: (draft: IdeaDraft) => void;
  recordSong: (id: string) => void;
  finishSong: (id: string, producer: 'Teo Park' | 'Self') => void;
  scheduleSong: (id: string, releaseDay: number, campaign: CampaignTier) => void;
  archiveSong: (id: string) => void;
  publishPost: (platform: string, text: string, mode?: string) => void;
  acceptOpportunity: (id: string) => void;
  planCampaign: (songId: string, channel: CampaignChannel, startDay?: number, durationDays?: number) => void;
  cancelCampaign: (id: string) => void;
  createAlbumProject: (title: string, songIds: string[]) => void;
  setAlbumFocusTrack: (projectId: string, songId: string) => void;
  releaseAlbum: (projectId: string) => void;
  acceptIndustryOffer: (id: string) => void;
  declineIndustryOffer: (id: string) => void;
  submitAward: (awardId: string, songId: string) => void;
  resolveAwards: () => void;
  doCareerWork: (type: CareerWork['type']) => void;
  trainCareer: (skill: TrainingSkill) => void;
  messagePerson: (name: string, choice?: RelationshipChoice) => void;
  dismissEvent: () => void;
  spend: (amount: number, description?: string) => void;
  transferMoney: (amount: number, direction: 'deposit' | 'withdraw') => void;
  reset: () => void;
};

export const opportunityCatalog: Opportunity[] = [
  {
    id: 'festival', type: 'LIVE · LAGOS', title: 'Lagos Music Festival',
    detail: 'Golden-hour main-stage slot. Your first crowd this size.', cost: 420, city: 'Lagos', location: 'Freedom Park Stage', availableFrom: '4:00 PM', availableUntil: '10:00 PM', expiresOnDay: 12, tone: 'gold',
    effects: { cash: 3200, fans: 50000, hype: 7, reputation: 4, energy: -17 },
  },
  {
    id: 'label', type: 'CAREER · PRIVATE', title: 'Aster House Records',
    detail: 'A three-single conversation; creative control stays on the table.', cost: 0, expiresOnDay: 18, tone: 'rose',
    effects: { cash: 80000, fans: 0, hype: 0, reputation: 45, energy: -6 },
  },
  {
    id: 'collab', type: 'SESSION · ATLANTA', title: 'Seyi Vibe — late session',
    detail: 'A new voice, a new city, and a beat made for the windows down.', cost: 250, city: 'Atlanta', expiresOnDay: 10, tone: 'blue',
    effects: { cash: 0, fans: 21000, hype: 18, reputation: 3, energy: -12 },
  },
  {
    id: 'campaign', type: 'BRAND · INBOUND', title: 'Northstar Studio campaign',
    detail: 'A small independent label wants you in their fall film.', cost: 0, expiresOnDay: 10, tone: 'gold',
    effects: { cash: 8500, fans: 12000, hype: 5, reputation: 3, energy: 0 },
    requirements: { minReputation: 60, songStatus: 'RELEASED' },
  },
];

const initialState: PersistentState = {
  artist: { name: 'Candelar', handle: '@candelar', origin: 'Lagos', genre: 'Afro-fusion' },
  money: 4320, bank: 28000, fans: 482000, monthlyListeners: 482000, hype: 72, energy: 73, mood: 85, creativity: 64, reputation: 78,
  currentCity: 'Lagos', currentLocation: 'The Apartment', day: 6, time: '6:42 PM', weather: 'Warm rain · 28°',
  songs: [
    { id: 's1', title: 'Never Met You', genre: 'Afro-fusion', mood: 'Midnight', bpm: 104, quality: 88, streams: 1240000, status: 'RELEASED', producer: 'Teo Park', releasedOnDay: 2 },
    { id: 's2', title: 'Lagos Nights', genre: 'Afrobeats', mood: 'Golden hour', bpm: 112, quality: 82, streams: 892000, status: 'RELEASED', producer: 'Teo Park', releasedOnDay: 4 },
    { id: 's3', title: 'Better Days', genre: 'Alt R&B', mood: 'Hopeful', bpm: 86, quality: 64, streams: 0, status: 'DEMO', producer: 'You', inspiration: 'A softer ending' },
    { id: 's4', title: 'Dreams in Stereo', genre: 'Alternative', mood: 'Wistful', bpm: 96, quality: 45, streams: 0, status: 'IDEA', producer: 'You', inspiration: 'A room at 2am' },
  ],
  relationships: [
    { name: 'Teo Park', role: 'Producer · close friend', trust: 82, note: 'Free tonight? I found a new pocket for the hook.', avatar: 'TP' },
    { name: 'Maya Ellis', role: 'Singer · creative spark', trust: 76, note: 'Your snippet found its way onto my For You.', avatar: 'ME' },
    { name: 'Seyi Vibe', role: 'Artist · Atlanta collaborator', trust: 68, note: 'Atlanta could be special. Come through when you’re ready.', avatar: 'SV' },
  ],
  notifications: ['Teo sent you a message', 'Lagos Music Festival added a stage'],
  opportunities: opportunityCatalog,
  posts: [],
  eventNight: null,
  passes: [],
  memories: [],
  wardrobe: [],
  equippedLook: 'city-basics',
  ledger: [
    { id: 'seed-ledger-1', day: 5, description: 'Last royalty payout · catalog', amount: 680, balanceAfter: 4320, bucket: 'cash' },
    { id: 'seed-ledger-2', day: 5, description: 'Studio session · Better Days', amount: -125, balanceAfter: 3640, bucket: 'cash' },
  ],
  history: [
    { id: 'seed-history-1', day: 6, time: '6:42 PM', title: 'A Lagos evening', detail: 'Teo sent a message about a new pocket for the hook.' },
  ],
  chapterStage: 'A producer has invited you to a session',
  lastEvent: '',
  cityDemand: {}, songCampaigns: [], albumProjects: [], industryInbox: [], awards: buildAwards(6, [
    { id: 's1', title: 'Never Met You', genre: 'Afro-fusion', mood: 'Midnight', bpm: 104, quality: 88, streams: 1240000, status: 'RELEASED', producer: 'Teo Park', releasedOnDay: 2 },
    { id: 's2', title: 'Lagos Nights', genre: 'Afrobeats', mood: 'Golden hour', bpm: 112, quality: 82, streams: 892000, status: 'RELEASED', producer: 'Teo Park', releasedOnDay: 4 },
  ], 482000, 78), awardsHistory: [],
  careerWork: dailyCareerWork(6, 78, [
    { id: 's1', title: 'Never Met You', genre: 'Afro-fusion', mood: 'Midnight', bpm: 104, quality: 88, streams: 1240000, status: 'RELEASED', producer: 'Teo Park' },
    { id: 's2', title: 'Lagos Nights', genre: 'Afrobeats', mood: 'Golden hour', bpm: 112, quality: 82, streams: 892000, status: 'RELEASED', producer: 'Teo Park' },
  ]), trainingHistory: [], skills: { VOCALS: 0, SONGWRITING: 0, PERFORMANCE: 0, BUSINESS: 0, PRODUCTION: 0 },
};

const initialForMigration = initialState as unknown as Record<string, unknown>;
const addNotice = (state: PersistentState, note: string) => [note, ...state.notifications].slice(0, 8);
const addHistory = (state: PersistentState, title: string, detail: string, day = state.day, time = state.time) => [
  { id: `h-${day}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, day, time, title, detail },
  ...state.history,
].slice(0, 100);
const ledgerEntry = (state: PersistentState, description: string, amount: number, bucket: 'cash' | 'bank', balanceAfter: number, day = state.day): LedgerEntry[] => [
  { id: `l-${day}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, day, description, amount, balanceAfter, bucket },
  ...state.ledger,
].slice(0, 100);
const recordEvent = (state: PersistentState, title: string, detail: string, notification = detail) => ({
  lastEvent: detail,
  notifications: addNotice(state, notification),
  history: addHistory(state, title, detail),
});
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const validCities = ['Lagos', 'London', 'New York', 'Los Angeles', 'Atlanta', 'Toronto', 'Accra', 'Johannesburg', 'Paris', 'Tokyo', 'Seoul', 'Dubai'];

export const useGame = create<GameState>()(persist((set, get) => ({
  ...initialState,
  sleep: () => get().advanceDay(),
  advanceDay: () => set((state) => {
    const nextDay = state.day + 1;
    let earnedStreams = 0;
    let royalties = 0;
    let newFans = 0;
    const releaseNotes: string[] = [];
    const completedCampaigns = state.songCampaigns.filter(c => c.status !== 'CANCELLED' && c.endDay < nextDay && c.status !== 'COMPLETED');
    let campaignFans = 0; let campaignStreams = 0;
    const songById = (id: string) => state.songs.find(song => song.id === id);
    const songCampaigns = state.songCampaigns.map(c => {
      if (!completedCampaigns.some(done => done.id === c.id)) return c.status === 'PLANNED' && c.startDay <= nextDay ? { ...c, status: 'ACTIVE' as const } : c;
      const song = songById(c.songId); if (!song) return { ...c, status: 'COMPLETED' as const, completedOnDay: nextDay };
      const outcome = resolveCampaign(c, song, state.fans, state.hype); campaignFans += outcome.fans; campaignStreams += outcome.streams;
      return { ...c, status: 'COMPLETED' as const, measuredReach: outcome.reach, measuredFans: outcome.fans, measuredStreams: outcome.streams, completedOnDay: nextDay };
    });
    const songs = state.songs.map((song) => {
      if (song.status === 'SCHEDULED' && song.releaseDay !== undefined && song.releaseDay <= nextDay && canTransitionSong(song.status, 'RELEASED')) {
        const outcome = resolveRelease(song, state.fans, state.hype, state.artist.genre, nextDay);
        earnedStreams += outcome.streams;
        royalties += outcome.royalties;
        newFans += outcome.newFans;
        releaseNotes.push(`${song.title} released · ${outcome.streams.toLocaleString()} first-day streams`);
        return { ...song, status: 'RELEASED' as const, releasedOnDay: nextDay, streams: song.streams + outcome.streams, lastDailyStreams: outcome.streams };
      }
      if (song.status === 'RELEASED') {
        const daily = simulateDailyStreams(song, state.fans, state.hype, nextDay);
        earnedStreams += daily;
        royalties += Math.round(daily * 0.003);
        return { ...song, streams: song.streams + daily, lastDailyStreams: daily };
      }
      return song;
    });
    const monthlyGain = newFans * 2 + Math.round(earnedStreams * 0.012) + campaignFans;
    const generatedInbox = makeIndustryOffers(nextDay, songs, state.fans + newFans + campaignFans, state.reputation);
    const inboxIds = new Set(state.industryInbox.map(o => o.id));
    const completedOffers = state.industryInbox.filter(o => o.status === 'ACCEPTED' && o.acceptedOnDay !== undefined && o.acceptedOnDay < nextDay);
    const completedIds = new Set(completedOffers.map(o => o.id));
    const industryInbox = [...state.industryInbox.filter(o => !['EXPIRED', 'COMPLETED'].includes(o.status)).map(o => completedIds.has(o.id) ? { ...o, status: 'COMPLETED' as const, completedOnDay: nextDay } : o), ...generatedInbox.filter(o => !inboxIds.has(o.id))].slice(-30);
    const expired = state.opportunities.filter((offer) => shouldExpireOpportunity(offer, nextDay));
    const opportunities = state.opportunities.filter((offer) => !shouldExpireOpportunity(offer, nextDay));
    const expiredInbox = state.industryInbox.map(o => o.status === 'OPEN' && o.expiresOnDay < nextDay ? { ...o, status: 'EXPIRED' as const } : o);
    const completedCash = completedOffers.reduce((sum, o) => sum + o.cashReward, 0);
    const completedFans = completedOffers.reduce((sum, o) => sum + o.fanReward, 0);
    const completedRep = completedOffers.reduce((sum, o) => sum + o.reputationReward, 0);
    const dueAwards = state.awards.filter(a => a.submissionStatus === 'SUBMITTED' && a.ceremonyDay <= nextDay);
    const resolvedAwards = state.awards.map(a => {
      if (!dueAwards.some(d => d.id === a.id)) return a;
      const decision = awardDecision(a, songs.find(s => s.id === a.eligibleSongId), state.fans + newFans + campaignFans + completedFans, state.reputation + completedRep);
      return { ...a, submissionStatus: decision, decidedOnDay: nextDay, historyNote: `${decision.toLowerCase()} on day ${nextDay}.` };
    });
    const awardHistory = resolvedAwards.filter(a => dueAwards.some(d => d.id === a.id));

    const time = '8:12 AM';
    const dailyCash = royalties + completedCash;
    const recap = [
      `Day ${nextDay} in ${state.currentCity}: ${earnedStreams.toLocaleString()} streams`,
      royalties ? `$${royalties.toLocaleString()} royalties earned` : 'No royalty payout yet',
      completedOffers.length ? `${completedOffers.length} industry offer(s) completed · +$${completedCash.toLocaleString()} · +${completedFans.toLocaleString()} fans · +${completedRep} reputation` : '',
      newFans ? `+${newFans.toLocaleString()} new fans` : '',
      expired.length ? `${expired.length} offer${expired.length > 1 ? 's' : ''} expired` : '',
      ...releaseNotes,
    ].filter(Boolean).join(' · ');
    const base = {
      ...state,
      songs,
      awards: resolvedAwards,
      awardsHistory: awardHistory.length ? [...awardHistory, ...state.awardsHistory].slice(0, 50) : state.awardsHistory,
      songCampaigns,
      industryInbox: [...expiredInbox.filter(o => !generatedInbox.some(n => n.id === o.id) && !completedIds.has(o.id)), ...industryInbox],
      careerWork: dailyCareerWork(nextDay, state.reputation, songs),
      day: nextDay,
      time,
      energy: clamp(state.energy + 35),
      mood: clamp(state.mood + 5),
      creativity: clamp(state.creativity + 3),
      fans: state.fans + newFans + campaignFans + completedFans,
      monthlyListeners: Math.max(0, state.monthlyListeners + monthlyGain + Math.round(campaignStreams * 0.02)),
      hype: clamp(state.hype + (releaseNotes.length ? 8 : 0)),
      opportunities,
      chapterStage: releaseNotes.length ? 'Your first release is out; listen for the city’s answer' : state.chapterStage,
      money: state.money + royalties + completedCash,
      reputation: clamp(state.reputation + completedRep),
      lastEvent: recap,
      notifications: addNotice(state, recap),
      history: addHistory(state, `Day ${nextDay} recap`, recap, nextDay, time),
      ledger: dailyCash ? ledgerEntry(state, completedOffers.length ? `Day ${nextDay} royalties & industry settlements` : `Day ${nextDay} streaming royalties`, dailyCash, 'cash', state.money + dailyCash, nextDay) : state.ledger,
    };
    return base;
  }),
  eat: () => set((state) => {
    if (state.money < 18) return { lastEvent: 'You are short on cash for a meal right now.' };
    const next = { ...state, money: state.money - 18, energy: clamp(state.energy + 12), mood: clamp(state.mood + 5) };
    const event = recordEvent(next, 'A late bite', 'Jollof and plantain from the corner spot. Energy +12 · $18.');
    return { ...next, ...event, ledger: ledgerEntry(state, 'Dinner · jollof and plantain', -18, 'cash', state.money - 18) };
  }),
  travel: (city) => set((state) => {
    if (!validCities.includes(city)) return { lastEvent: 'That destination is not on the map yet.' };
    if (city === state.currentCity) return { lastEvent: `You are already in ${city}.` };
    if (state.money < 420) return { lastEvent: 'You need $420 cash for the ticket. Take a show or deal first.' };
    if (state.energy < 15) return { lastEvent: 'You need at least 15 energy for the journey. Rest or eat first.' };
    const location = city === 'Atlanta' ? 'Seyi’s Eastside Loft' : city === 'Lagos' ? 'The Apartment' : `${city} Artist’s Loft`;
    const weather = city === 'Lagos' ? 'Warm rain · 28°' : city === 'Atlanta' ? 'Clear night · 21°' : city === 'London' ? 'Light rain · 15°' : city === 'Tokyo' ? 'Neon haze · 19°' : 'Clear evening · 20°';
    const next = { ...state, currentCity: city, currentLocation: location, weather, money: state.money - 420, energy: state.energy - 15, time: '10:08 PM' };
    const detail = `You made it to ${city}. ${city === 'Atlanta' ? 'Seyi’s late session is close by; the city has a different rhythm.' : 'New streets, new possibilities.'} −$420 · −15 energy.`;
    return { ...next, ...recordEvent(next, `Arrived in ${city}`, detail, `Landed in ${city}. The city feels different after dark.`), ledger: ledgerEntry(state, `Travel · ${state.currentCity} to ${city}`, -420, 'cash', state.money - 420) };
  }),
  travelLocally: (destination, mode) => set((state) => {
    if (state.currentCity !== 'Lagos') return { lastEvent: 'The neighborhood map is ready in Lagos. Travel home first to use these local stops.' };
    const place = LAGOS_PLACES.find((item) => item.id === destination);
    if (!place) return { lastEvent: 'That stop is not on this local map.' };
    const origin = LAGOS_PLACES.find((item) => item.name === state.currentLocation)?.id ?? 'apartment';
    if (origin === destination) {
      if (destination === 'venue' && state.eventNight?.stage === 'shared') {
        return { eventNight: { ...state.eventNight, stage: 'arrived', ride: { mode, fare: 0, minutes: 0, from: state.currentLocation, arrivalTime: state.time } }, lastEvent: 'Your shared plan is at Freedom Park. The live set is ready when you are.' };
      }
      return { lastEvent: `You are already at ${place.name}.` };
    }
    const route = localRoute(origin, destination, mode);
    if (state.money < route.fare) return { lastEvent: `You need $${route.fare} cash for that ${route.mode.toLowerCase()} ride.` };
    if (state.energy < route.energy) return { lastEvent: `You need ${route.energy} energy to walk that route. Take a ride or rest first.` };
    if (destination !== 'apartment' && clockMinutes(state.time) + route.minutes > clockMinutes('10:30 PM')) return { lastEvent: 'It is getting late to head farther out. Go home, or try this trip tomorrow.' };
    const arrivalTime = addClockMinutes(state.time, route.minutes);
    const eventNight = state.eventNight
      ? destination === 'venue' && state.eventNight.stage === 'shared'
        ? { ...state.eventNight, stage: 'arrived' as const, ride: { mode, fare: route.fare, minutes: route.minutes, from: state.currentLocation, arrivalTime } }
        : destination !== 'venue' && state.eventNight.stage === 'arrived'
          ? { ...state.eventNight, stage: 'shared' as const, ride: undefined }
          : state.eventNight
      : null;
    const next = { ...state, eventNight, currentLocation: place.name, money: state.money - route.fare, energy: clamp(state.energy - route.energy), time: arrivalTime };
    const fareCopy = route.fare ? ` · −$${route.fare}` : '';
    const energyCopy = route.energy ? ` · −${route.energy} energy` : '';
    const detail = `${route.mode} from ${state.currentLocation} to ${place.name} · ${route.minutes} minutes${fareCopy}${energyCopy}.`;
    return { ...next, ...recordEvent(next, `Across Lagos · ${place.name}`, detail, `You reached ${place.name} in ${route.minutes} minutes.`), ledger: route.fare ? ledgerEntry(state, `${route.mode} · ${place.name}`, -route.fare, 'cash', state.money - route.fare) : state.ledger };
  }),
  shareEventPlan: ({ people, mood, budget }) => set((state) => {
    const event = state.opportunities.find((offer) => offer.id === 'festival');
    if (!event) return { lastEvent: 'The Lagos Music Festival offer is no longer open.' };
    if (!['low-key', 'social', 'high-energy'].includes(mood)) return { lastEvent: 'Choose a mood for the night first.' };
    if (!Number.isFinite(budget) || budget < 0 || budget > 100000) return { lastEvent: 'Set a spending cap between $0 and $100,000 of game cash.' };
    const knownPeople = new Set(state.relationships.map((person) => person.name));
    const invitees = [...new Set(people.filter((name) => knownPeople.has(name)))].slice(0, 5);
    const arrived = state.eventNight?.stage === 'arrived' || state.currentCity === 'Lagos' && state.currentLocation === event.location;
    const eventNight: EventNightPlan = {
      eventId: 'festival', stage: arrived ? 'arrived' : 'shared', people: invitees, mood, budget: Math.floor(budget),
      day: state.eventNight?.day ?? state.day, sharedAt: state.time, ...(state.eventNight?.ride ? { ride: state.eventNight.ride } : {}),
    };
    const who = invitees.length ? invitees.join(', ') : 'a solo night';
    const detail = `A ${mood.replace('-', ' ')} festival plan with ${who} · $${eventNight.budget.toLocaleString()} game-cash cap. Saved in this story; no real messages were sent.`;
    const next = { ...state, eventNight };
    return { ...next, ...recordEvent(next, `Plan saved · ${event.title}`, detail, `Your festival plan is saved with ${who}.`) };
  }),
  saveEventMemory: (note) => set((state) => {
    const pass = (state.eventNight?.ticketId && state.passes.find((item) => item.id === state.eventNight?.ticketId)) ?? state.passes.find((item) => item.eventId === 'festival');
    if (!pass) return { lastEvent: 'Finish the festival set before saving its memory.' };
    if (state.memories.some((memory) => memory.passId === pass.id)) return { lastEvent: 'That night already has a saved memory.' };
    const copy = note.trim().slice(0, 500);
    if (!copy) return { lastEvent: 'Add one detail you want to remember.' };
    const memory: MemoryRecord = {
      id: `memory-${pass.id}`, passId: pass.id, eventId: 'festival', title: pass.eventTitle,
      location: pass.venue, day: pass.day, time: pass.time, people: state.eventNight?.people ?? [],
      ...(state.eventNight ? { mood: state.eventNight.mood } : {}), note: copy,
    };
    const eventNight = state.eventNight ? { ...state.eventNight, stage: 'recorded' as const, memoryId: memory.id } : null;
    const next = { ...state, eventNight, memories: [memory, ...state.memories].slice(0, 100) };
    const detail = `You kept a memory from ${pass.eventTitle} at ${pass.venue}. It is saved with this game story.`;
    return { ...next, ...recordEvent(next, `Memory saved · ${pass.eventTitle}`, detail) };
  }),
  createIdea: (draft) => set((state) => {
    const title = draft.title.trim();
    if (!title) return { lastEvent: 'Give the idea a working title first.' };
    if (state.songs.some((song) => song.title.toLowerCase() === title.toLowerCase())) return { lastEvent: 'There is already a song with that title. Try another working title.' };
    const song: Song = {
      id: `song-${Date.now()}`, title: title.slice(0, 48), genre: draft.genre, mood: draft.mood,
      bpm: clamp(Math.round(draft.bpm), 60, 180), quality: clamp(Math.round(state.creativity * 0.45 + 25), 30, 75),
      streams: 0, status: 'IDEA', producer: 'You', inspiration: draft.inspiration,
    };
    const next = { ...state, songs: [song, ...state.songs], creativity: clamp(state.creativity + 2), chapterStage: 'You have an idea; find its first demo take' };
    return { ...next, ...recordEvent(next, `Idea saved · ${song.title}`, `${song.title} is an idea, not a finished record. Choose a sound and a feeling, then book a demo.`) };
  }),
  recordSong: (id) => set((state) => {
    const song = state.songs.find((item) => item.id === id);
    if (!song) return { lastEvent: 'That song is no longer in your catalogue.' };
    if (!canTransitionSong(song.status, 'DEMO')) return { lastEvent: 'Only an idea can move into a demo. Finish the current stage first.' };
    if (state.energy < 20) return { lastEvent: 'You need 20 energy for a studio take. Rest or eat first.' };
    if (state.money < 125) return { lastEvent: 'The demo session costs $125 cash. Find a way to earn it first.' };
    const quality = clamp(Math.round(38 + state.creativity * 0.32 + state.energy * 0.22 + (song.genre === state.artist.genre ? 8 : 4) + (song.mood ? 3 : 0) + (state.skills.VOCALS ?? 0) * 0.10 + (state.skills.SONGWRITING ?? 0) * 0.10), 40, 95);
    const updated = { ...song, status: 'DEMO' as const, quality, producer: 'You' };
    const next = { ...state, songs: state.songs.map((item) => item.id === id ? updated : item), money: state.money - 125, energy: state.energy - 18, creativity: clamp(state.creativity + 7), chapterStage: 'The demo is down; decide how to finish the record' };
    const detail = `Demo recorded for “${song.title}” · quality ${quality}/100 · $125 · −18 energy.`;
    return { ...next, ...recordEvent(next, `Demo recorded · ${song.title}`, detail), ledger: ledgerEntry(state, `Studio demo · ${song.title}`, -125, 'cash', state.money - 125) };
  }),
  finishSong: (id, producer) => set((state) => {
    const song = state.songs.find((item) => item.id === id);
    if (!song) return { lastEvent: 'That song is no longer in your catalogue.' };
    if (!canTransitionSong(song.status, 'FINISHED')) return { lastEvent: 'Only a demo can be finished. Ideas need a demo take first.' };
    const cost = producer === 'Teo Park' ? 210 : 0;
    const energyCost = producer === 'Teo Park' ? 12 : 8;
    if (producer === 'Teo Park' && state.currentCity !== 'Lagos') return { lastEvent: 'Teo’s finishing room is in Lagos. Travel home or finish this one yourself.' };
    if (state.money < cost) return { lastEvent: `Teo’s mix session costs $${cost}. Choose a self-finish or earn more cash.` };
    if (state.energy < energyCost) return { lastEvent: `You need ${energyCost} energy to finish a record. Rest first.` };
    const boost = producer === 'Teo Park' ? 10 : 5;
    const skillBoost = (state.skills.PRODUCTION ?? 0) * 0.10 + (state.skills.SONGWRITING ?? 0) * 0.05;
    const updated = { ...song, status: 'FINISHED' as const, producer, quality: clamp(Math.round(song.quality + boost + skillBoost), 40, 99) };
    const next = { ...state, songs: state.songs.map((item) => item.id === id ? updated : item), money: state.money - cost, energy: state.energy - energyCost, chapterStage: 'The master is ready; choose a release date and rollout' };
    const detail = `“${song.title}” is finished with ${producer === 'Teo Park' ? 'Teo Park' : 'a self-mix'} · quality ${updated.quality}/100${cost ? ` · −$${cost}` : ''} · −${energyCost} energy.`;
    const rels = producer === 'Teo Park' ? next.relationships.map((person) => person.name === 'Teo Park' ? { ...person, trust: clamp(person.trust + 5), note: `You finished “${song.title}” together. The master is ready.` } : person) : next.relationships;
    return { ...next, relationships: rels, ...recordEvent(next, `Master finished · ${song.title}`, detail), ledger: cost ? ledgerEntry(state, `Teo Park mix session · ${song.title}`, -cost, 'cash', state.money - cost) : state.ledger };
  }),
  scheduleSong: (id, releaseDay, campaign) => set((state) => {
    const song = state.songs.find((item) => item.id === id);
    if (!song) return { lastEvent: 'That song is no longer in your catalogue.' };
    if (!canTransitionSong(song.status, 'SCHEDULED')) return { lastEvent: 'Finish the master before you set a release date.' };
    if (!Number.isInteger(releaseDay) || releaseDay <= state.day || releaseDay > state.day + 14) return { lastEvent: 'Choose a release date between tomorrow and 14 days from now.' };
    const plan = CAMPAIGN_PLANS[campaign];
    if (!plan) return { lastEvent: 'Choose one of the available release plans.' };
    if (state.money < plan.budget) return { lastEvent: `This rollout needs $${plan.budget}. Choose a smaller plan or earn more cash.` };
    const updated = { ...song, status: 'SCHEDULED' as const, releaseDay, campaign, marketingBudget: plan.budget };
    const next = { ...state, songs: state.songs.map((item) => item.id === id ? updated : item), money: state.money - plan.budget, chapterStage: 'Release day is on the calendar; keep the story moving' };
    const detail = `“${song.title}” is scheduled for day ${releaseDay} · ${plan.label} · forecast ${resolveRelease(updated, state.fans, state.hype, state.artist.genre, releaseDay).forecast.toLocaleString()} first-day streams.`;
    return { ...next, ...recordEvent(next, `Release scheduled · ${song.title}`, detail), ledger: plan.budget ? ledgerEntry(state, `${plan.label} · ${song.title}`, -plan.budget, 'cash', state.money - plan.budget) : state.ledger };
  }),
  archiveSong: (id) => set((state) => {
    const song = state.songs.find((item) => item.id === id);
    if (!song || !canTransitionSong(song.status, 'ARCHIVED')) return { lastEvent: 'Released or already archived songs cannot be archived from this menu.' };
    const next = { ...state, songs: state.songs.map((item) => item.id === id ? { ...item, status: 'ARCHIVED' as const } : item) };
    return { ...next, ...recordEvent(next, `Idea shelved · ${song.title}`, `“${song.title}” is safely archived. You can make room for another idea.`) };
  }),
  publishPost: (platform, text, mode = 'post') => set((state) => {
    const copy = text.trim();
    if (!copy) return { lastEvent: 'Add a little context before you share it.' };
    const normalized = platform.toLowerCase();
    const profile = socialPostRequirements(platform, mode);
    if (state.money < profile.cash) return { lastEvent: `This ${platform} video needs $${profile.cash} for production.` };
    if (state.energy < profile.energy) return { lastEvent: `${platform} needs ${profile.energy} energy for this kind of moment.` };
    const modeMultiplier = mode === 'trend-reply' ? 0.72 : mode === 'story' ? 0.78 : mode === 'live' ? 1.2 : mode === 'video' ? 1.24 : mode === 'snippet' ? 1.3 : mode === 'repost' ? 1.18 : mode === 'backstage' ? 1.08 : mode === 'event' ? 1.12 : mode === 'interview' ? 1.08 : 1;
    const reach = Math.round(profile.reach * modeMultiplier * (0.76 + state.hype / 250));
    const newFans = reach ? Math.max(0, Math.round(reach * (normalized === 'tiktok' && mode === 'snippet' ? 0.48 : 0.24) * (0.8 + state.creativity / 250))) : 0;
    const controversy = normalized === 'x' && mode === 'trend-reply' && copy.toLowerCase().includes('controversial');
    const repDelta = controversy ? -3 : normalized === 'x' && mode === 'trend-reply' ? 2 : 1;
    const next = {
      ...state,
      money: state.money - profile.cash,
      energy: clamp(state.energy - profile.energy),
      posts: [{ platform, text: copy, likes: Math.max(12, Math.round(reach * 0.13)), time: 'now', mode }, ...state.posts].slice(0, 20),
      fans: state.fans + newFans,
      hype: clamp(state.hype + (normalized === 'twitch' && mode === 'live' ? 9 : 4)),
      reputation: clamp(state.reputation + repDelta),
      monthlyListeners: state.monthlyListeners + Math.round(newFans * 0.2),
    };
    const outcome = `${platform} · ${mode.replaceAll('-', ' ')}: ${reach.toLocaleString()} simulated reach${newFans ? ` · +${newFans.toLocaleString()} fans` : ''}${profile.cash ? ` · −$${profile.cash}` : ''}${profile.energy ? ` · −${profile.energy} energy` : ''}.`;
    return { ...next, ...recordEvent(next, `${platform} · ${mode.replaceAll('-', ' ')}`, outcome, `${platform} is moving. ${newFans ? `+${newFans.toLocaleString()} new fans found you.` : 'Your catalog is in motion.'}`), ledger: profile.cash ? ledgerEntry(state, `${platform} video production`, -profile.cash, 'cash', state.money - profile.cash) : state.ledger };
  }),
  acceptOpportunity: (id) => set((state) => {
    const offer = state.opportunities.find((item) => item.id === id);
    if (!offer) return { lastEvent: 'That opportunity is no longer available.' };
    const blocked = opportunityBlockReason(offer, state);
    if (blocked) return { lastEvent: blocked };
    const changes = applyOpportunityEffects(state, offer);
    const pass: EventPass | null = offer.id === 'festival' ? {
      id: `pass-festival-${state.day}-${Date.now()}`, eventId: 'festival', eventTitle: offer.title, passType: 'Artist pass',
      venue: offer.location ?? 'Freedom Park Stage', day: state.day, time: state.time, entryCost: offer.cost,
      ...(state.eventNight?.ride ? { rideMode: state.eventNight.ride.mode } : {}), simulationOnly: true,
    } : null;
    const eventNight = pass && state.eventNight?.eventId === 'festival'
      ? { ...state.eventNight, stage: 'attended' as const, ticketId: pass.id }
      : state.eventNight;
    const next = {
      ...state,
      ...changes,
      fans: state.fans + offer.effects.fans,
      monthlyListeners: state.monthlyListeners + Math.round(offer.effects.fans * 0.4),
      opportunities: state.opportunities.filter((item) => item.id !== id),
      eventNight,
      passes: pass ? [pass, ...state.passes].slice(0, 20) : state.passes,
      chapterStage: offer.id === 'festival' ? 'The crowd has heard you; carry that momentum into the next release' : state.chapterStage,
      cityDemand: offer.id === 'festival' ? { ...state.cityDemand, Lagos: Math.min(100, (state.cityDemand.Lagos ?? 0) + 1) } : state.cityDemand,
    };
    const parts = [
      offer.effects.cash ? `${offer.effects.cash > 0 ? '+' : '−'}$${Math.abs(offer.effects.cash).toLocaleString()} cash` : '',
      offer.effects.fans ? `+${offer.effects.fans.toLocaleString()} fans` : '',
      offer.effects.hype ? `${offer.effects.hype > 0 ? '+' : ''}${offer.effects.hype} hype` : '',
      offer.effects.reputation ? `${offer.effects.reputation > 0 ? '+' : ''}${offer.effects.reputation} reputation` : '',
      offer.cost ? `−$${offer.cost.toLocaleString()} cost` : '',
    ].filter(Boolean).join(' · ');
    const detail = `You accepted ${offer.title}. ${parts}.`;
    return { ...next, ...recordEvent(next, `Accepted · ${offer.title}`, detail, `Accepted: ${offer.title}. ${parts}.`), ledger: offer.effects.cash !== 0 || offer.cost ? ledgerEntry(state, `${offer.title} · net cash`, offer.effects.cash - offer.cost, 'cash', state.money + offer.effects.cash - offer.cost) : state.ledger };
  }),
  messagePerson: (name, choice = 'reply') => set((state) => {
    const person = state.relationships.find((item) => item.name === name);
    if (!person) return { lastEvent: 'That conversation is no longer open.' };
    const cost = choice === 'accept-session' ? 210 : 0;
    const energy = choice === 'accept-session' ? 12 : choice === 'help' ? 8 : 0;
    if (choice === 'accept-session' && name === 'Teo Park' && state.currentCity !== 'Lagos') return { lastEvent: 'Teo’s session is in Lagos. Travel back before you confirm.' };
    if (state.money < cost) return { lastEvent: `You need $${cost} cash to book that session.` };
    if (state.energy < energy) return { lastEvent: `You need ${energy} energy to make good on that promise.` };
    const trustDelta = choice === 'accept-session' || choice === 'help' ? 8 : choice === 'decline' ? -2 : 4;
    const note = choice === 'accept-session' ? 'Session confirmed. You both have something to bring to the room.' : choice === 'help' ? 'You showed up for them. They will remember that.' : choice === 'decline' ? 'You passed kindly and protected your time. The door is still open.' : 'You replied. The next part of the conversation is taking shape.';
    const next = {
      ...state,
      money: state.money - cost,
      energy: clamp(state.energy - energy),
      relationships: state.relationships.map((item) => item.name === name ? { ...item, trust: clamp(item.trust + trustDelta), note } : item),
      mood: clamp(state.mood + (choice === 'decline' ? 0 : 2)),
    };
    const detail = choice === 'accept-session' ? `You booked a session with ${name}. −$210 · −12 energy · trust +8.` : choice === 'help' ? `You made time to help ${name}. −8 energy · trust +8.` : choice === 'decline' ? `You declined ${name}’s invitation without burning the bridge. Trust −2.` : `You replied to ${name}. Trust +4; the conversation stays open.`;
    return { ...next, ...recordEvent(next, `Message · ${name}`, detail, `You sent ${name} a message.`), ledger: cost ? ledgerEntry(state, `Session deposit · ${name}`, -cost, 'cash', state.money - cost) : state.ledger };
  }),
  planCampaign: (songId, channel, startDay = get().day, durationDays = CAMPAIGN_CHANNELS[channel]?.days ?? 1) => set((state) => {
    const song = state.songs.find(s => s.id === songId); const profile = CAMPAIGN_CHANNELS[channel];
    if (!song || !profile) return { lastEvent: 'Choose a real released song and campaign channel.' };
    if (song.status !== 'RELEASED') return { lastEvent: 'Campaigns require a released song.' };
    if (state.songCampaigns.some(c => c.songId === songId && ['PLANNED','ACTIVE'].includes(c.status))) return { lastEvent: 'That song already has an active campaign.' };
    const plan = campaignPlan(song, channel, Math.max(state.day, Math.floor(startDay)), durationDays, state.fans, state.hype, `campaign-${songId}-${channel}-${state.day}`, state.skills.BUSINESS);
    plan.status = plan.startDay === state.day ? 'ACTIVE' : 'PLANNED';
    if (plan.startDay > state.day + 14) return { lastEvent: 'Campaigns can only be planned within the next 14 days.' };
    if (state.money < plan.cost) return { lastEvent: `You need $${plan.cost.toLocaleString()} cash for this campaign.` };
    if (state.energy < plan.energyCost) return { lastEvent: `You need ${plan.energyCost} energy for this campaign.` };
    const next = { ...state, money: state.money - plan.cost, energy: state.energy - plan.energyCost, songCampaigns: [plan, ...state.songCampaigns].slice(0, 30) };
    return { ...next, ...recordEvent(next, `Campaign planned · ${song.title}`, `${channel} campaign for “${song.title}” · ${plan.durationDays} day(s) · forecast ${plan.expectedReach.toLocaleString()} reach.`), ledger: plan.cost ? ledgerEntry(state, `${channel} campaign · ${song.title}`, -plan.cost, 'cash', next.money) : state.ledger };
  }),
  cancelCampaign: (id) => set((state) => { const c = state.songCampaigns.find(x => x.id === id); if (!c || !['PLANNED','ACTIVE'].includes(c.status)) return { lastEvent: 'That campaign is no longer cancellable.' }; return { songCampaigns: state.songCampaigns.map(x => x.id === id ? { ...x, status: 'CANCELLED' as const } : x), lastEvent: 'Campaign cancelled; past spend is not refunded.' }; }),
  createAlbumProject: (title, songIds) => set((state) => { const ids = [...new Set(songIds)].filter(id => state.songs.some(s => s.id === id && s.status !== 'ARCHIVED')).slice(0, 12); const name = title.trim().slice(0, 60); if (!name || ids.length < 2) return { lastEvent: 'An album needs a title and at least two catalogue songs.' }; const project: AlbumProject = { id: `album-${state.day}-${Date.now()}`, title: name, songIds: ids, status: 'PLANNING', createdOnDay: state.day, budget: ids.length * 180, spent: 0, quality: Math.round(ids.reduce((n, id) => n + (state.songs.find(s => s.id === id)?.quality ?? 0), 0) / ids.length) }; return { albumProjects: [project, ...state.albumProjects].slice(0, 10), lastEvent: `Album project created · ${name}.` }; }),
  setAlbumFocusTrack: (projectId, songId) => set((state) => { const p = state.albumProjects.find(x => x.id === projectId); if (!p || !p.songIds.includes(songId) || !state.songs.some(s => s.id === songId)) return { lastEvent: 'The focus track must be an actual song on that album.' }; return { albumProjects: state.albumProjects.map(x => x.id === projectId ? { ...x, focusTrackId: songId, ...(x.status === 'RELEASED' ? {} : { status: 'IN_PROGRESS' as const }) } : x), lastEvent: 'Album focus track selected.' }; }),
  releaseAlbum: (projectId) => set((state) => { const p = state.albumProjects.find(x => x.id === projectId); if (!p) return { lastEvent: 'That album project is not in this save.' }; if (p.status === 'RELEASED' || p.status === 'CANCELLED') return { lastEvent: 'This album project can no longer be released.' }; if (!p.focusTrackId || !p.songIds.includes(p.focusTrackId)) return { lastEvent: 'Choose an album focus track first.' }; const projectSongs = p.songIds.map(id => state.songs.find(s => s.id === id)); if (projectSongs.some(s => !s || s.status !== 'RELEASED')) return { lastEvent: 'Every album song must already be released before the album can release.' }; if (state.money < p.budget) return { lastEvent: `You need $${p.budget.toLocaleString()} cash to release this album.` }; const next = { ...state, money: state.money - p.budget, albumProjects: state.albumProjects.map(x => x.id === projectId ? { ...x, status: 'RELEASED' as const, spent: x.budget, targetReleaseDay: state.day } : x), hype: clamp(state.hype + 8), reputation: clamp(state.reputation + 3) }; return { ...next, ...recordEvent(next, `Album released · ${p.title}`, `${p.title} is out with ${p.songIds.length} released tracks and ${p.focusTrackId} as focus.`), ledger: ledgerEntry(state, `Album release · ${p.title}`, -p.budget, 'cash', next.money) }; }),
  acceptIndustryOffer: (id) => set((state) => { const o = state.industryInbox.find(x => x.id === id); if (!o) return { lastEvent: 'That inbox offer is gone.' }; const blocked = canAcceptIndustryOffer(o, state.day, state.money, state.energy, state.fans, state.reputation, state.songs); if (blocked) return { lastEvent: blocked }; const next = { ...state, money: state.money - o.cashCost, energy: state.energy - o.energyCost, industryInbox: state.industryInbox.map(x => x.id === id ? { ...x, status: 'ACCEPTED' as const, acceptedOnDay: state.day } : x) }; return { ...next, ...recordEvent(next, `Inbox accepted · ${o.title}`, `Accepted ${o.title}. Costs paid now: −$${o.cashCost.toLocaleString()} · −${o.energyCost} energy. Rewards settle on the next day.`), ledger: o.cashCost ? ledgerEntry(state, `${o.title} acceptance cost`, -o.cashCost, 'cash', next.money) : state.ledger }; }),
  declineIndustryOffer: (id) => set((state) => { const o = state.industryInbox.find(x => x.id === id); if (!o || o.status !== 'OPEN') return { lastEvent: 'That inbox offer is no longer open.' }; return { industryInbox: state.industryInbox.map(x => x.id === id ? { ...x, status: 'DECLINED' as const } : x), lastEvent: `Declined · ${o.title}.` }; }),
  submitAward: (awardId, songId) => set((state) => { const a = state.awards.find(x => x.id === awardId); const song = state.songs.find(x => x.id === songId); if (!a || a.submissionStatus !== 'ELIGIBLE' || a.eligibleSongId || !song || !state.songs.some(s => s.id === songId) || !eligibleAward(song, state.fans, state.reputation)) return { lastEvent: 'That song is not eligible for this award submission.' }; return { awards: state.awards.map(x => x.id === awardId ? { ...x, eligibleSongId: songId, submissionStatus: 'SUBMITTED' as const, submittedOnDay: state.day, historyNote: `Submitted by player for ${song.title}.` } : x), lastEvent: `Award submission sent for ${song.title}.` }; }),
  resolveAwards: () => set((state) => { const due = state.awards.filter(a => a.ceremonyDay <= state.day && a.submissionStatus === 'SUBMITTED'); if (!due.length) return { lastEvent: 'No award decisions are due yet.' }; const awards = state.awards.map(a => { const song = state.songs.find(s => s.id === a.eligibleSongId); const decision = due.some(d => d.id === a.id) ? awardDecision(a, song, state.fans, state.reputation) : a.submissionStatus; return due.some(d => d.id === a.id) ? { ...a, submissionStatus: decision, decidedOnDay: state.day, historyNote: `${decision.toLowerCase()} on day ${state.day}.` } : a; }); const decisions = awards.filter(a => due.some(d => d.id === a.id)); return { awards, awardsHistory: [...decisions, ...state.awardsHistory].slice(0, 50), lastEvent: `Awards resolved · ${decisions.map(a => `${a.name}: ${a.submissionStatus.toLowerCase()}`).join(', ')}.` }; }),
  doCareerWork: (type) => set((state) => { const job = state.careerWork.find(w => w.type === type && w.status === 'AVAILABLE'); if (!job) return { lastEvent: 'That work slot is not available today.' }; if (state.energy < job.energyCost) return { lastEvent: `You need ${job.energyCost} energy for that job.` }; const skill = careerWorkOutcome(job, state.skills); const next = { ...state, time: addClockMinutes(state.time, job.durationHours * 60), money: state.money + job.cashReward, energy: state.energy - job.energyCost, reputation: clamp(state.reputation + job.reputationReward), skills: { ...state.skills, [skill.skill]: skill.skillAfter }, careerWork: state.careerWork.map(w => w.id === job.id ? { ...w, status: 'COMPLETED' as const } : w) }; return { ...next, ...recordEvent(next, `Work completed · ${job.title}`, `Earned $${job.cashReward.toLocaleString()} · −${job.energyCost} energy · ${job.durationHours} hours used · +${skill.skillGain} ${skill.skill.toLowerCase()} skill.`), ledger: ledgerEntry(state, job.title, job.cashReward, 'cash', next.money) }; }),
  trainCareer: (skill) => set((state) => { const c = TRAINING_COSTS[skill]; if (!c) return { lastEvent: 'Choose a valid training skill.' }; if (state.money < c.cash || state.energy < c.energy) return { lastEvent: `Training needs $${c.cash} and ${c.energy} energy.` }; const before = clamp(state.skills[skill] ?? 0); const gain = Math.max(0, Math.min(8, 3 + Math.floor(state.creativity / 30), 100 - before)); const next = { ...state, money: state.money - c.cash, energy: state.energy - c.energy, skills: { ...state.skills, [skill]: before + gain }, trainingHistory: [{ id: `training-${skill}-${state.day}-${Date.now()}`, skill, day: state.day, cashCost: c.cash, energyCost: c.energy, skillGain: gain }, ...state.trainingHistory].slice(0, 100) }; return { ...next, ...recordEvent(next, `Training · ${skill.toLowerCase()}`, `Skill +${gain} (now ${before + gain}/100) · −$${c.cash} · −${c.energy} energy.`), ledger: ledgerEntry(state, `Training · ${skill}`, -c.cash, 'cash', next.money) }; }),
  dismissEvent: () => set({ lastEvent: '' }),
  spend: (amount, description = 'A little something for the next chapter') => set((state) => {
    const cost = Math.max(0, Math.floor(amount));
    if (!cost || state.money < cost) return { lastEvent: cost ? `You need $${cost.toLocaleString()} cash for that.` : '' };
    const next = { ...state, money: state.money - cost };
    const detail = `${description} · −$${cost.toLocaleString()}.`;
    return { ...next, ...recordEvent(next, description, detail), ledger: ledgerEntry(state, description, -cost, 'cash', state.money - cost) };
  }),
  buyBoutiqueItem: (id) => set((state) => {
    const item = BOUTIQUE_ITEMS.find((candidate) => candidate.id === id);
    if (!item) return { lastEvent: 'That piece is not in the boutique today.' };
    if (state.wardrobe.includes(item.id)) return { lastEvent: `${item.name} is already in your wardrobe.` };
    if (state.money < item.price) return { lastEvent: `You need $${item.price.toLocaleString()} cash for ${item.name}.` };
    const next = { ...state, money: state.money - item.price, wardrobe: [...state.wardrobe, item.id], equippedLook: item.id, mood: clamp(state.mood + 2) };
    const detail = `${item.name} added to your wardrobe and picked out for tonight · −$${item.price.toLocaleString()}.`;
    return { ...next, ...recordEvent(next, `A new piece · ${item.name}`, detail), ledger: ledgerEntry(state, `Boutique · ${item.name}`, -item.price, 'cash', next.money) };
  }),
  transferMoney: (amount, direction) => set((state) => {
    const value = Math.floor(Number(amount));
    if (!Number.isFinite(value) || value <= 0) return { lastEvent: 'Choose an amount greater than zero.' };
    if (direction === 'deposit' && state.money < value) return { lastEvent: 'There is not enough cash in your wallet for that transfer.' };
    if (direction === 'withdraw' && state.bank < value) return { lastEvent: 'There is not enough in savings for that transfer.' };
    const cashDelta = direction === 'deposit' ? -value : value;
    const bankDelta = -cashDelta;
    const next = { ...state, money: state.money + cashDelta, bank: state.bank + bankDelta };
    const detail = `${direction === 'deposit' ? 'Moved to savings' : 'Withdrew from savings'} · $${value.toLocaleString()}.`;
    return { ...next, ...recordEvent(next, 'Bank transfer', detail), ledger: [
      ...ledgerEntry(state, `Transfer · ${direction === 'deposit' ? 'cash to bank' : 'bank to cash'}`, cashDelta, 'cash', next.money),
      ...ledgerEntry(state, `Transfer · ${direction === 'deposit' ? 'cash to bank' : 'bank to cash'}`, bankDelta, 'bank', next.bank),
    ].slice(0, 100) };
  }),
  reset: () => set({ ...initialState }),
}), {
  name: 'treblr-world-save-v1',
  version: 4,
  storage: createJSONStorage(() => localStorage),
  migrate: (persisted, _version) => migrateSaveData(persisted, initialForMigration, opportunityCatalog) as unknown as GameState,
  partialize: (state) => {
    const { sleep: _sleep, advanceDay: _advanceDay, eat: _eat, travel: _travel, travelLocally: _travelLocally, shareEventPlan: _shareEventPlan, saveEventMemory: _saveEventMemory, buyBoutiqueItem: _buyBoutiqueItem, createIdea: _createIdea, recordSong: _recordSong, finishSong: _finishSong, scheduleSong: _scheduleSong, archiveSong: _archiveSong, publishPost: _publishPost, acceptOpportunity: _acceptOpportunity, planCampaign: _planCampaign, cancelCampaign: _cancelCampaign, createAlbumProject: _createAlbumProject, setAlbumFocusTrack: _setAlbumFocusTrack, releaseAlbum: _releaseAlbum, acceptIndustryOffer: _acceptIndustryOffer, declineIndustryOffer: _declineIndustryOffer, submitAward: _submitAward, resolveAwards: _resolveAwards, doCareerWork: _doCareerWork, trainCareer: _trainCareer, messagePerson: _messagePerson, dismissEvent: _dismissEvent, spend: _spend, transferMoney: _transferMoney, reset: _reset, ...data } = state;
    return data as GameState;
  },
}));
