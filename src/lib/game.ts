'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type SongStatus = 'IDEA' | 'DEMO' | 'FINISHED' | 'SCHEDULED' | 'RELEASED';
export type Song = { id: string; title: string; genre: string; mood: string; bpm: number; quality: number; streams: number; status: SongStatus; producer: string };
export type Opportunity = { id: string; type: string; title: string; detail: string; reward: string; cost: number; city?: string; deadline: string; tone: 'gold' | 'rose' | 'blue' };
export type GameState = {
  artist: { name: string; handle: string; origin: string; genre: string };
  money: number; bank: number; fans: number; monthlyListeners: number; hype: number; energy: number; mood: number; creativity: number; reputation: number;
  currentCity: string; currentLocation: string; day: number; time: string; weather: string;
  songs: Song[]; relationships: { name: string; role: string; trust: number; note: string; avatar: string }[];
  notifications: string[]; opportunities: Opportunity[]; posts: { platform: string; text: string; likes: number; time: string }[];
  lastEvent: string;
  sleep: () => void; eat: () => void; travel: (city: string) => void; recordSong: (title: string, genre: string, mood: string) => void;
  releaseSong: (id: string) => void; publishPost: (platform: string, text: string) => void; acceptOpportunity: (id: string) => void;
  messagePerson: (name: string) => void; dismissEvent: () => void; spend: (amount: number) => void; reset: () => void;
};

const initial = {
  artist: { name: 'Candelar', handle: '@candelar', origin: 'Lagos', genre: 'Afro-fusion' },
  money: 4320, bank: 28000, fans: 482000, monthlyListeners: 482000, hype: 72, energy: 73, mood: 85, creativity: 64, reputation: 78,
  currentCity: 'Lagos', currentLocation: 'The Apartment', day: 6, time: '6:42 PM', weather: 'Warm rain · 28°',
  songs: [
    { id: 's1', title: 'Never Met You', genre: 'Afro-fusion', mood: 'Midnight', bpm: 104, quality: 88, streams: 1240000, status: 'RELEASED' as SongStatus, producer: 'Teo Park' },
    { id: 's2', title: 'Lagos Nights', genre: 'Afrobeats', mood: 'Golden hour', bpm: 112, quality: 82, streams: 892000, status: 'RELEASED' as SongStatus, producer: 'Teo Park' },
    { id: 's3', title: 'Better Days', genre: 'Alt R&B', mood: 'Hopeful', bpm: 86, quality: 64, streams: 0, status: 'DEMO' as SongStatus, producer: 'You' },
    { id: 's4', title: 'Dreams in Stereo', genre: 'Alternative', mood: 'Wistful', bpm: 96, quality: 45, streams: 0, status: 'IDEA' as SongStatus, producer: 'You' },
  ],
  relationships: [
    { name: 'Teo Park', role: 'Producer · close friend', trust: 82, note: 'Free tonight? I found a new pocket for the hook.', avatar: 'TP' },
    { name: 'Maya Ellis', role: 'Singer · creative spark', trust: 76, note: 'Your snippet found its way onto my For You.', avatar: 'ME' },
    { name: 'Seyi Vibe', role: 'Artist · collaborator', trust: 68, note: 'A London session could be special.', avatar: 'SV' },
  ],
  notifications: ['Your snippet is finding listeners in Accra', 'Teo sent you a message', 'Lagos Music Festival added a stage'],
  opportunities: [
    { id: 'festival', type: 'LIVE · LAGOS', title: 'Lagos Music Festival', detail: 'Golden-hour main-stage slot. Your first crowd this size.', reward: '+50K fans · +$3.2K', cost: 420, city: 'Lagos', deadline: 'OCT 12', tone: 'gold' as const },
    { id: 'label', type: 'CAREER · PRIVATE', title: 'Aster House Records', detail: 'A 3-single conversation. Creative control is still on the table.', reward: '+$80K advance · +45 rep', cost: 0, deadline: '12 DAYS', tone: 'rose' as const },
    { id: 'collab', type: 'SESSION · ATLANTA', title: 'Seyi Vibe — late session', detail: 'A new voice, a new city, and a beat made for the windows down.', reward: '+120K hype', cost: 250, city: 'Atlanta', deadline: 'FRI · 9 PM', tone: 'blue' as const },
    { id: 'campaign', type: 'BRAND · INBOUND', title: 'Northstar Studio campaign', detail: 'A small independent label wants you in their fall film.', reward: '+$8.5K · +12K fans', cost: 0, deadline: 'OCT 10', tone: 'gold' as const },
  ],
  posts: [
    { platform: 'Instagram', text: 'last night is still ringing in my head. lagos, you were everything.', likes: 18420, time: '2h' },
    { platform: 'TikTok', text: 'the voice note that started Never Met You 🎙️', likes: 62800, time: '5h' },
    { platform: 'X', text: 'making the kind of music i needed when i was 16.', likes: 2910, time: '1d' },
  ],
  lastEvent: '',
};

const addNotice = (s: GameState, note: string) => [note, ...s.notifications].slice(0, 8);

export const useGame = create<GameState>()(persist((set, get) => ({
  ...initial,
  sleep: () => set((s) => ({ energy: Math.min(100, s.energy + 42), mood: Math.min(100, s.mood + 8), creativity: Math.min(100, s.creativity + 5), time: '8:12 AM', day: s.day + 1, lastEvent: 'A full night’s rest. You wake up with a clearer head.', notifications: addNotice(s, 'A new day is yours.') })),
  eat: () => set((s) => s.money < 18 ? { lastEvent: 'You are short on cash for a meal right now.' } : ({ money: s.money - 18, energy: Math.min(100, s.energy + 12), mood: Math.min(100, s.mood + 5), lastEvent: 'Jollof and plantain from the corner spot. Energy +12 · $18.', notifications: addNotice(s, 'You grabbed a late bite nearby.') })),
  travel: (city) => set((s) => city === s.currentCity ? { lastEvent: `You are already in ${city}.` } : s.money < 420 ? { lastEvent: 'You need $420 for the ticket. Take a show or deal first.' } : ({ currentCity: city, currentLocation: 'Artist’s Loft', money: s.money - 420, energy: Math.max(0, s.energy - 15), time: '10:08 PM', lastEvent: `You made it to ${city}. New streets, new possibilities.`, notifications: addNotice(s, `Landed in ${city}. The city feels different after dark.`) })),
  recordSong: (title, genre, mood) => set((s) => {
    if (s.energy < 20) return { lastEvent: 'You are too drained to make something honest. Rest first.' };
    if (s.money < 125) return { lastEvent: 'The studio needs $125 for the session. Get out there and earn it.' };
    const quality = Math.max(40, Math.min(99, Math.round(s.creativity * .38 + s.energy * .2 + 46 + Math.random() * 13)));
    const song = { id: `s${Date.now()}`, title: title.trim() || 'Untitled feeling', genre, mood, bpm: 82 + Math.floor(Math.random() * 40), quality, streams: 0, status: 'DEMO' as SongStatus, producer: quality > 78 ? 'Teo Park' : 'You' };
    return { songs: [song, ...s.songs], energy: s.energy - 18, money: s.money - 125, creativity: Math.min(100, s.creativity + 7), hype: Math.min(100, s.hype + 4), lastEvent: `“${song.title}” is in your library. Quality ${quality} · ${song.bpm} BPM.`, notifications: addNotice(s, `A new demo is taking shape: ${song.title}.`) };
  }),
  releaseSong: (id) => set((s) => {
    const song = s.songs.find((item) => item.id === id);
    if (!song || song.status === 'RELEASED') return {};
    const fans = Math.round(9000 + song.quality * 420);
    return { songs: s.songs.map((item) => item.id === id ? { ...item, status: 'RELEASED' } : item), fans: s.fans + fans, monthlyListeners: s.monthlyListeners + fans * 2, hype: Math.min(100, s.hype + 13), money: s.money + 680, lastEvent: `“${song.title}” is out in the world. First-week forecast: ${(fans * 12).toLocaleString()} streams.`, notifications: addNotice(s, `Your new single “${song.title}” is live everywhere.`) };
  }),
  publishPost: (platform, text) => set((s) => {
    const reach = platform === 'TikTok' ? 16800 : platform === 'Instagram' ? 8200 : platform === 'YouTube' ? 6200 : 1900;
    const newFans = Math.round(reach * (.35 + Math.random() * .9));
    return { posts: [{ platform, text, likes: Math.round(reach * .13), time: 'now' }, ...s.posts].slice(0, 20), fans: s.fans + newFans, hype: Math.min(100, s.hype + 5), reputation: Math.min(100, s.reputation + 1), monthlyListeners: s.monthlyListeners + Math.round(newFans * .2), lastEvent: `${platform} is moving. +${newFans.toLocaleString()} new fans found you.`, notifications: addNotice(s, `Your ${platform} post is getting noticed.`) };
  }),
  acceptOpportunity: (id) => set((s) => {
    const o = s.opportunities.find((item) => item.id === id);
    if (!o) return {};
    if (s.money < o.cost) return { lastEvent: `You need $${o.cost.toLocaleString()} for this one. Try another path first.` };
    const fansGain = o.id === 'festival' ? 50000 : o.id === 'campaign' ? 12000 : o.id === 'collab' ? 21000 : 0;
    const moneyGain = o.id === 'festival' ? 3200 : o.id === 'campaign' ? 8500 : o.id === 'label' ? 80000 : 0;
    const reputation = o.id === 'label' ? 12 : o.id === 'festival' ? 4 : 3;
    return { opportunities: s.opportunities.filter((item) => item.id !== id), money: s.money - o.cost + moneyGain, fans: s.fans + fansGain, hype: Math.min(100, s.hype + (o.id === 'collab' ? 18 : 7)), reputation: Math.min(100, s.reputation + reputation), energy: Math.max(0, s.energy - (o.id === 'festival' ? 17 : 6)), lastEvent: `You said yes to ${o.title}. The story keeps moving.`, notifications: addNotice(s, `Accepted: ${o.title}. People are already talking.`) };
  }),
  messagePerson: (name) => set((s) => ({ relationships: s.relationships.map((r) => r.name === name ? { ...r, trust: Math.min(100, r.trust + 4), note: 'Just replied — the next session is starting to take shape.' } : r), mood: Math.min(100, s.mood + 2), lastEvent: `You reached out to ${name}. A small thing can change the whole night.`, notifications: addNotice(s, `You sent ${name} a message.`) })),
  dismissEvent: () => set({ lastEvent: '' }),
  spend: (amount) => set((s) => ({ money: Math.max(0, s.money - amount), lastEvent: `A little something for the next chapter. −$${amount.toLocaleString()}.` })),
  reset: () => set({ ...initial }),
}), { name: 'treblr-world-save-v1', storage: createJSONStorage(() => localStorage), partialize: (s) => ({ ...s }) as GameState }));
