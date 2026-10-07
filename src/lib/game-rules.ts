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

export type LagosPlaceId = "apartment" | "studio" | "cafe" | "venue";
export type LocalTravelMode = "walk" | "danfo" | "ride-hailing";
export const LAGOS_PLACES: { id: LagosPlaceId; name: string; area: string; detail: string; x: number; y: number }[] = [
  { id: "apartment", name: "The Apartment", area: "Anifowose Street · Yaba", detail: "Home base, a quiet room above the city.", x: 21, y: 63 },
  { id: "studio", name: "Teo’s Studio", area: "Onike Road · Yaba", detail: "The finishing room where the hook found its shape.", x: 46, y: 31 },
  { id: "cafe", name: "June Coffee", area: "Herbert Macaulay Way · Yaba", detail: "A small table, strong coffee, and room to talk.", x: 72, y: 52 },
  { id: "venue", name: "Freedom Park Stage", area: "Broad Street · Lagos Island", detail: "An open-air stage inside the old city walls.", x: 84, y: 82 },
];
export const BOUTIQUE_ITEMS = [
  { id: "lagos-night-jacket", name: "Lagos night jacket", price: 550, note: "Light cotton, built for the walk between rooms." },
  { id: "studio-headphones", name: "Studio headphones", price: 320, note: "A little more quiet when the city gets loud." },
  { id: "stage-boots", name: "Worn-in stage boots", price: 240, note: "Soft enough for a long set." },
] as const;

const localHops: Record<LagosPlaceId, Record<LagosPlaceId, number>> = {
  apartment: { apartment: 0, studio: 1, cafe: 1, venue: 3 },
  studio: { apartment: 1, studio: 0, cafe: 1, venue: 3 },
  cafe: { apartment: 1, studio: 1, cafe: 0, venue: 2 },
  venue: { apartment: 3, studio: 3, cafe: 2, venue: 0 },
};
const travelModes: Record<LocalTravelMode, { label: string; baseFare: number; farePerHop: number; baseMinutes: number; minutesPerHop: number; energyPerHop: number }> = {
  walk: { label: "Walk", baseFare: 0, farePerHop: 0, baseMinutes: 0, minutesPerHop: 18, energyPerHop: 5 },
  danfo: { label: "Danfo", baseFare: 1, farePerHop: 2, baseMinutes: 4, minutesPerHop: 12, energyPerHop: 0 },
  "ride-hailing": { label: "Ride-hailing", baseFare: 6, farePerHop: 8, baseMinutes: 5, minutesPerHop: 7, energyPerHop: 0 },
};

export function localRoute(origin: LagosPlaceId, destination: LagosPlaceId, mode: LocalTravelMode) {
  const hops = localHops[origin][destination];
  const plan = travelModes[mode];
  return { fare: hops ? plan.baseFare + plan.farePerHop * hops : 0, minutes: hops ? plan.baseMinutes + plan.minutesPerHop * hops : 0, energy: plan.energyPerHop * hops, mode: plan.label };
}

export function clockMinutes(time: string) {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
  return hour * 60 + Number(match[2]);
}

export function addClockMinutes(time: string, minutes: number) {
  const total = Math.min(23 * 60 + 50, clockMinutes(time) + Math.max(0, minutes));
  const hour24 = Math.floor(total / 60);
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(total % 60).padStart(2, "0")} ${hour24 >= 12 ? "PM" : "AM"}`;
}

export function timeInWindow(time: string, start: string, end: string) {
  const value = clockMinutes(time);
  return value >= clockMinutes(start) && value <= clockMinutes(end);
}

export function socialPostRequirements(platform: string, mode: string) {
  const normalized = platform.toLowerCase();
  const costs: Record<string, { cash: number; energy: number; reach: number }> = {
    instagram: { cash: 0, energy: 2, reach: 8200 }, tiktok: { cash: 0, energy: 6, reach: 16800 }, x: { cash: 0, energy: 1, reach: 2300 },
    youtube: { cash: 180, energy: 10, reach: 6200 }, twitch: { cash: 0, energy: 14, reach: 5600 }, snapchat: { cash: 0, energy: 3, reach: 4300 },
    soundcloud: { cash: 0, energy: 2, reach: 5900 }, audiomack: { cash: 0, energy: 2, reach: 4800 }, threads: { cash: 0, energy: 1, reach: 2800 },
    facebook: { cash: 0, energy: 2, reach: 3900 }, "apple music": { cash: 0, energy: 0, reach: 3400 }, spotify: { cash: 0, energy: 0, reach: 0 },
  };
  let profile = costs[normalized] ?? { cash: 0, energy: 2, reach: 2500 };
  if (normalized === "youtube") profile = mode === "interview" ? { cash: 80, energy: 5, reach: 4200 } : mode === "live" ? { cash: 0, energy: 14, reach: 5400 } : { cash: 180, energy: 10, reach: 6200 };
  if (normalized === "facebook" && mode === "event") profile = { cash: 0, energy: 3, reach: 5200 };
  if (normalized === "twitch" && mode === "community") profile = { cash: 0, energy: 2, reach: 2600 };
  return profile;
}

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
  location?: string;
  availableFrom?: string;
  availableUntil?: string;
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
  currentLocation?: string;
  time?: string;
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
  if (opportunity.location && opportunity.location !== state.currentLocation) return `Head to ${opportunity.location} before accepting.`;
  if (opportunity.availableFrom && opportunity.availableUntil && state.time && !timeInWindow(state.time, opportunity.availableFrom, opportunity.availableUntil)) return `Available ${opportunity.availableFrom}–${opportunity.availableUntil}.`;
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
  const nightStages = ["shared", "arrived", "attended", "recorded"];
  const nightMoods = ["low-key", "social", "high-energy"];
  const rawNight = saved.eventNight && typeof saved.eventNight === "object" && !Array.isArray(saved.eventNight)
    ? saved.eventNight as Record<string, unknown>
    : null;
  const eventNight = saved.eventNight === null ? null : rawNight && nightStages.includes(String(rawNight.stage))
    ? {
        ...rawNight,
        eventId: "festival",
        stage: String(rawNight.stage),
        people: Array.isArray(rawNight.people) ? rawNight.people.filter((person): person is string => typeof person === "string").slice(0, 5) : [],
        mood: nightMoods.includes(String(rawNight.mood)) ? String(rawNight.mood) : "social",
        budget: Math.max(0, numeric(rawNight.budget, 900)),
        day: Math.max(1, Math.floor(numeric(rawNight.day, Number(saved.day ?? defaults.day ?? 1)))),
        sharedAt: typeof rawNight.sharedAt === "string" ? rawNight.sharedAt : String(saved.time ?? defaults.time ?? ""),
      }
    : defaults.eventNight;
  const passes = Array.isArray(saved.passes) ? saved.passes.filter((item) => item && typeof item === "object" && !Array.isArray(item)) : defaults.passes;
  const memories = Array.isArray(saved.memories) ? saved.memories.filter((item) => item && typeof item === "object" && !Array.isArray(item)) : defaults.memories;
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
    wardrobe: Array.isArray(saved.wardrobe) ? saved.wardrobe.filter((item): item is string => typeof item === "string") : defaults.wardrobe,
    equippedLook: typeof saved.equippedLook === "string" ? saved.equippedLook : defaults.equippedLook,
    songs,
    opportunities,
    eventNight,
    passes,
    memories,
    relationships: Array.isArray(saved.relationships) ? saved.relationships : defaults.relationships,
    notifications: Array.isArray(saved.notifications) ? saved.notifications.slice(0, 8) : defaults.notifications,
    posts: Array.isArray(saved.posts) ? saved.posts : defaults.posts,
    ledger: Array.isArray(saved.ledger) ? saved.ledger : [],
    history: Array.isArray(saved.history) ? saved.history : [],
  } as T;
}
