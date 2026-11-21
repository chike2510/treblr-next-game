'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Song } from './game-rules';

export type TourSong = Pick<Song, 'id' | 'title' | 'quality' | 'status'>;
export type TourVenue = { id: string; name: string; city: string; capacity: number; guarantee: number; rental: number; vibe: string };
export type TourSetlist = { id: string; name: string; songIds: string[]; createdAt: number };
export type TourBooking = {
  id: string; setlistId: string; city: string; venueId: string; ticketPrice: number; bookedDay: number;
  status: 'booked' | 'completed'; estimate: TourEstimate; result?: TourResult; feePaid?: number;
};
export type TourEstimate = { demand: number; expectedSales: number; gross: number; costs: number; expectedProfit: number; risk: 'low' | 'medium' | 'high'; confidence: string };
export type TourResult = { actualSales: number; gross: number; costs: number; profit: number; fansGained: number; energySpent: number; demandAfter: number; headline: string };

export const TOUR_VENUES: TourVenue[] = [
  { id: 'lagos-yard', name: 'Yard 44', city: 'Lagos', capacity: 420, guarantee: 180, rental: 260, vibe: 'Sweaty room · home crowd' },
  { id: 'lagos-park', name: 'Freedom Park Annex', city: 'Lagos', capacity: 900, guarantee: 350, rental: 620, vibe: 'Open air · festival energy' },
  { id: 'atlanta-east', name: 'Eastside Room', city: 'Atlanta', capacity: 550, guarantee: 280, rental: 480, vibe: '808s · late session crowd' },
  { id: 'london-basement', name: 'The Basement', city: 'London', capacity: 700, guarantee: 420, rental: 760, vibe: 'Concrete · all-night pulse' },
  { id: 'nyc-circuit', name: 'Circuit Hall', city: 'New York', capacity: 1100, guarantee: 700, rental: 1250, vibe: 'Bright room · high stakes' },
  { id: 'accra-rooftop', name: 'Rooftop 21', city: 'Accra', capacity: 650, guarantee: 300, rental: 520, vibe: 'Warm air · new energy' },
];

export const TOUR_CITIES = [...new Set(TOUR_VENUES.map((venue) => venue.city))];
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const safeInt = (n: number, fallback = 0) => Number.isFinite(n) ? Math.floor(n) : fallback;

export function estimateTour({ songs, city, venue, ticketPrice, fans, currentCity, cityDemand, performance = 0 }: {
  songs: TourSong[]; city: string; venue: TourVenue; ticketPrice: number; fans: number; currentCity: string; cityDemand?: number; performance?: number;
}): TourEstimate {
  const validSongs = songs.filter((song) => song.status === 'RELEASED');
  const quality = validSongs.length ? validSongs.reduce((sum, song) => sum + clamp(song.quality, 0, 100), 0) / validSongs.length : 0;
  const local = city === currentCity ? 1.16 : 0.78;
  const market = clamp(Number.isFinite(cityDemand) ? Number(cityDemand) : 50, 10, 100) / 100;
  const catalog = clamp(validSongs.length * 0.16 + quality / 250 + Math.log10(Math.max(10, fans)) / 12, 0.2, 1.25);
  const priceFit = clamp(1.15 - Math.max(0, ticketPrice - 25) / 160, 0.48, 1.15);
  const demand = clamp(Math.round((market * local * catalog * priceFit) * 100), 5, 100);
  const performanceBoost = 1 + clamp(performance, 0, 100) * 0.001;
  const expectedSales = clamp(Math.round(venue.capacity * (demand / 100) * (0.86 + quality / 700) * performanceBoost), 0, venue.capacity);
  const gross = expectedSales * ticketPrice;
  const costs = venue.rental + venue.guarantee + Math.round(expectedSales * 3.2);
  const expectedProfit = gross - costs;
  const risk = demand < 38 || expectedProfit < 0 ? 'high' : demand < 64 || expectedProfit < venue.rental * 0.35 ? 'medium' : 'low';
  return { demand, expectedSales, gross, costs, expectedProfit, risk, confidence: `${Math.round(demand)}% demand index · based on ${validSongs.length} released song${validSongs.length === 1 ? '' : 's'} · performance skill adds up to 10% seats` };
}

export function validateTourInput(input: { songs: TourSong[]; city: string; venue: TourVenue; ticketPrice: number; energy: number; money: number }) {
  if (!input.city || input.venue.city !== input.city) return 'Choose a venue in the selected city.';
  if (!input.songs.length || input.songs.some((song) => song.status !== 'RELEASED')) return 'A setlist can only use released songs.';
  if (new Set(input.songs.map((song) => song.id)).size !== input.songs.length) return 'Remove duplicate songs from the setlist.';
  if (!Number.isInteger(input.ticketPrice) || input.ticketPrice < 5 || input.ticketPrice > 200) return 'Ticket price must be a whole number from $5 to $200.';
  if (input.money < input.venue.rental + input.venue.guarantee) return `You need at least ${money(input.venue.rental + input.venue.guarantee)} cash to cover the room and guarantee.`;
  if (input.energy < tourEnergyCost(input.venue)) return `You need at least ${tourEnergyCost(input.venue)} energy to play this show.`;
  return null;
}

export function tourEnergyCost(venue: TourVenue) { return 18 + Math.ceil(venue.capacity / 250); }

export function resolveTour(booking: Pick<TourBooking, 'id' | 'estimate' | 'ticketPrice'>, venue: TourVenue, day: number, cityDemand = 50): TourResult {
  let hash = 2166136261;
  for (const char of `${booking.id}:${day}:${cityDemand}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const variance = 0.88 + ((hash >>> 0) / 4294967295) * 0.24;
  const actualSales = clamp(Math.round(booking.estimate.expectedSales * variance), 0, venue.capacity);
  const gross = actualSales * booking.ticketPrice;
  const costs = venue.rental + venue.guarantee + Math.round(actualSales * 3.2);
  const profit = gross - costs;
  const fansGained = Math.max(0, Math.round(actualSales * (0.22 + booking.estimate.demand / 500)));
  const demandAfter = clamp(Math.round(cityDemand + 1), 0, 100);
  return { actualSales, gross, costs, profit, fansGained, energySpent: tourEnergyCost(venue), demandAfter, headline: `${actualSales.toLocaleString()} tickets moved · ${profit >= 0 ? `+${money(profit)}` : `−${money(Math.abs(profit))}`} net` };
}

export type TourStore = { setlists: TourSetlist[]; bookings: TourBooking[]; saveSetlist: (name: string, songIds: string[]) => string | null; book: (booking: Omit<TourBooking, 'id' | 'status'>) => string; complete: (id: string, result: TourResult) => void };
export const useTourStore = create<TourStore>()(persist((set) => ({
  setlists: [], bookings: [],
  saveSetlist: (name, songIds) => {
    const clean = name.trim().slice(0, 42);
    const ids = [...new Set(songIds)].slice(0, 12);
    if (!clean || !ids.length) return null;
    const id = `setlist-${Date.now()}`;
    set((state) => ({ setlists: [{ id, name: clean, songIds: ids, createdAt: Date.now() }, ...state.setlists].slice(0, 30) }));
    return id;
  },
  book: (booking) => { const id = `tour-${booking.bookedDay}-${Date.now()}`; set((state) => ({ bookings: [{ ...booking, id, status: 'booked' as const }, ...state.bookings].slice(0, 50) })); return id; },
  complete: (id, result) => set((state) => ({ bookings: state.bookings.map((booking) => booking.id === id && booking.status === 'booked' ? { ...booking, status: 'completed' as const, result } : booking) })),
}), { name: 'treblr-tour-v1', storage: createJSONStorage(() => localStorage) }));

export const money = (value: number) => `$${Math.round(value).toLocaleString()}`;
export const asWhole = (value: string, fallback: number) => { const parsed = Number(value); return Number.isFinite(parsed) ? safeInt(parsed, fallback) : fallback; };
