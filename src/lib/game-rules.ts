export type SongStatus = "IDEA" | "DEMO" | "FINISHED" | "SCHEDULED" | "RELEASED" | "ARCHIVED";
export type CampaignTier = "organic" | "community" | "city-push";

export type Song = {
  id: string;
  title: string;
  genre: string;
  mood: string;
  bpm: number;
  quality: number;
  streams: number;
  status: SongStatus;
  producer: string;
  inspiration?: string;
  releaseDay?: number;
  marketingBudget?: number;
  campaign?: CampaignTier;
  releasedOnDay?: number;
  lastDailyStreams?: number;
};

export type OpportunityEffects = {
  cash: number;
  fans: number;
  hype: number;
  reputation: number;
  energy: number;
};

export type OpportunityRequirements = {
  minReputation?: number;
  songStatus?: SongStatus;
};

export type Opportunity = {
  id: string;
  type: string;
  title: string;
  detail: string;
  cost: number;
  city?: string;
  expiresOnDay: number;
  tone: "gold" | "rose" | "blue";
  effects: OpportunityEffects;
  requirements?: OpportunityRequirements;
};

export type OpportunityCheck = {
  currentCity: string;
  day: number;
  money: number;
  reputation: number;
  songs: Song[];
};

export type CampaignPlan = { label: string; budget: number; reachMultiplier: number };
export const CAMPAIGN_PLANS: Record<CampaignTier, CampaignPlan> = {
  organic: { label: "Organic release", budget: 0, reachMultiplier: 1 },
  community: { label: "Lagos community push", budget: 300, reachMultiplier: 1.16 },
  "city-push": { label: "Citywide campaign", budget: 900, reachMultiplier: 1.42 },
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const seededUnit = (seed: string) => {
  let value = 2166136261;
  for (let i = 0; i < seed.length; i += 1) value = Math.imul(value ^ seed.charCodeAt(i), 16777619);
  return (value >>> 0) / 4294967295;
};

export function canTransitionSong(from: SongStatus, to: SongStatus) {
  if (to === "ARCHIVED") return from !== "RELEASED" && from !== "ARCHIVED";
  const next: Partial<Record<SongStatus, SongStatus>> = {
    IDEA: "DEMO",
    DEMO: "FINISHED",
    FINISHED: "SCHEDULED",
    SCHEDULED: "RELEASED",
  };
  return next[from] === to;
}

export function opportunityBlockReason(opportunity: Opportunity, state: OpportunityCheck): string | null {
  if (state.day > opportunity.expiresOnDay) return "This offer expired when the day turned.";
  if (opportunity.city && opportunity.city !== state.currentCity) return `Travel to ${opportunity.city} before accepting.`;
  if (opportunity.requirements?.minReputation && state.reputation < opportunity.requirements.minReputation) {
    return `Requires ${opportunity.requirements.minReputation} reputation.`;
  }
  if (opportunity.requirements?.songStatus && !state.songs.some((song) => song.status === opportunity.requirements?.songStatus)) {
    return `Requires a ${opportunity.requirements.songStatus.toLowerCase()} in your catalogue.`;
  }
  if (state.money < opportunity.cost) return `You need $${opportunity.cost.toLocaleString()} cash for this offer.`;
  return null;
}

export function applyOpportunityEffects<T extends { money: number; fans: number; hype: number; reputation: number; energy: number }>(state: T, opportunity: Opportunity) {
  const effects = opportunity.effects;
  return {
    money: state.money - opportunity.cost + effects.cash,
    fans: state.fans + effects.fans,
    hype: clamp(state.hype + effects.hype, 0, 100),
    reputation: clamp(state.reputation + effects.reputation, 0, 100),
    energy: clamp(state.energy + effects.energy, 0, 100),
  };
}

export function campaignForecast(song: Pick<Song, "id" | "quality" | "genre" | "campaign" | "marketingBudget">, fans: number, hype: number, artistGenre: string) {
  const base = 2600 + song.quality * 390 + fans * 0.014 + hype * 80 + (song.genre === artistGenre ? 1400 : 0);
  const plan = song.campaign ? CAMPAIGN_PLANS[song.campaign] : CAMPAIGN_PLANS.organic;
  const campaignBudget = song.marketingBudget ?? plan.budget;
  return Math.max(1200, Math.round((base + campaignBudget * 14) * (campaignBudget ? plan.reachMultiplier : 1)));
}

export function resolveRelease(song: Song, fans: number, hype: number, artistGenre: string, day: number) {
  const forecast = campaignForecast(song, fans, hype, artistGenre);
  const boundedVariance = 0.9 + seededUnit(`${song.id}:${day}:release`) * 0.2;
  const streams = Math.max(1, Math.round(forecast * boundedVariance));
  const marketing = song.marketingBudget ?? 0;
  const newFans = Math.max(0, Math.round(streams * 0.018 + marketing * 0.45 + song.quality * 4));
  const royalties = Math.max(0, Math.round(streams * 0.003));
  return { streams, newFans, royalties, forecast };
}

export function simulateDailyStreams(song: Song, fans: number, hype: number, day: number) {
  const base = 700 + song.quality * 25 + fans * 0.0018 + hype * 18;
  const boundedVariance = 0.88 + seededUnit(`${song.id}:${day}:daily`) * 0.24;
  return Math.max(0, Math.round(base * boundedVariance));
}

export function shouldExpireOpportunity(opportunity: Opportunity, nextDay: number) {
  return opportunity.expiresOnDay < nextDay;
}

/** Migrate the persisted, JSON-safe portion of an older save without resurrecting completed offers. */
export function migrateSaveData<T extends Record<string, unknown>>(
  raw: unknown,
  defaults: T,
  canonicalOpportunities: Opportunity[],
): T {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaults;
  const saved = raw as Record<string, unknown>;
  const numeric = (value: unknown, fallback: number) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const savedOffers = Array.isArray(saved.opportunities) ? saved.opportunities : null;
  const opportunities = savedOffers === null
    ? defaults.opportunities
    : savedOffers.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const id = String((item as { id?: unknown }).id ?? "");
        const canonical = canonicalOpportunities.find((offer) => offer.id === id);
        return canonical ? [canonical] : [];
      });
  const validStatuses: SongStatus[] = ["IDEA", "DEMO", "FINISHED", "SCHEDULED", "RELEASED", "ARCHIVED"];
  const songs = Array.isArray(saved.songs) ? saved.songs.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const song = item as Record<string, unknown>;
    const status = validStatuses.includes(song.status as SongStatus) ? song.status as SongStatus : "IDEA";
    return [{ ...song, id: String(song.id ?? `song-${Date.now()}`), title: String(song.title ?? "Untitled idea"), status }];
  }) : defaults.songs;
  return {
    ...defaults,
    ...saved,
    artist: saved.artist && typeof saved.artist === "object" ? { ...(defaults.artist as Record<string, unknown>), ...(saved.artist as Record<string, unknown>) } : defaults.artist,
    day: Math.max(1, Math.floor(numeric(saved.day, Number(defaults.day ?? 1)))),
    money: Math.max(0, numeric(saved.money, Number(defaults.money ?? 0))),
    bank: Math.max(0, numeric(saved.bank, Number(defaults.bank ?? 0))),
    fans: Math.max(0, numeric(saved.fans, Number(defaults.fans ?? 0))),
    monthlyListeners: Math.max(0, numeric(saved.monthlyListeners, Number(defaults.monthlyListeners ?? 0))),
    energy: clamp(numeric(saved.energy, Number(defaults.energy ?? 0)), 0, 100),
    songs,
    opportunities,
    relationships: Array.isArray(saved.relationships) ? saved.relationships : defaults.relationships,
    notifications: Array.isArray(saved.notifications) ? saved.notifications.slice(0, 8) : defaults.notifications,
    posts: Array.isArray(saved.posts) ? saved.posts : defaults.posts,
    ledger: Array.isArray(saved.ledger) ? saved.ledger : [],
    history: Array.isArray(saved.history) ? saved.history : [],
  } as T;
}

