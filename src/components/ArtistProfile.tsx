'use client';

import '@/styles/artist-studio.css';
import { ArrowUpRight, Banknote, CircleDollarSign, Disc3, Flame, History, MapPin, Radio, Star, Users } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useGame } from '@/lib/game';

const short = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : value >= 1000 ? `${Math.round(value / 1000)}K` : `${value}`;
const money = (value: number) => `$${Math.round(value).toLocaleString()}`;

type Milestone = { key: string; label: string; detail: string; current: number; target: number; display: string; icon: typeof Star };

export default function ArtistProfile() {
  const game = useGame();
  const released = game.songs.filter((song) => song.status === 'RELEASED');
  const streams = released.reduce((sum, song) => sum + song.streams, 0);
  const tier = game.reputation >= 90 ? 'HEADLINER' : game.reputation >= 75 ? 'BREAKOUT' : game.reputation >= 50 ? 'EMERGING' : 'UNKNOWN';
  const tierFloor = tier === 'HEADLINER' ? 90 : tier === 'BREAKOUT' ? 75 : tier === 'EMERGING' ? 50 : 0;
  const nextTier = tier === 'HEADLINER' ? null : tier === 'BREAKOUT' ? 90 : tier === 'EMERGING' ? 75 : 50;
  const milestones = useMemo<Milestone[]>(() => [
    { key: 'release', label: 'First release', detail: 'Put one finished record into the living catalogue.', current: released.length, target: 1, display: `${released.length}/1 live`, icon: Disc3 },
    { key: 'audience', label: 'Build the room', detail: 'Reach 500,000 fans who are listening for the next move.', current: game.fans, target: 500000, display: `${short(game.fans)} / 500K fans`, icon: Users },
    { key: 'streams', label: 'Make the city listen', detail: 'Cross one million catalogue streams.', current: streams, target: 1000000, display: `${short(streams)} / 1M streams`, icon: Radio },
    { key: 'reputation', label: 'Earn your name', detail: 'Reach 90 reputation and enter headliner territory.', current: game.reputation, target: 90, display: `${game.reputation}/90 rep`, icon: Flame },
  ], [game.fans, game.reputation, released.length, streams]);
  const nextMilestone = milestones.find((milestone) => milestone.current < milestone.target) ?? milestones[milestones.length - 1];
  const progress = Math.min(100, Math.round((nextMilestone.current / nextMilestone.target) * 100));
  const netWorth = game.money + game.bank;
  return <section className="artist-profile" aria-labelledby="artist-profile-title"><div className="profile-masthead"><div className="profile-monogram">{game.artist.name.slice(0, 1).toUpperCase()}</div><div className="profile-identity"><span className="studio-kicker">ARTIST PROFILE <i>//</i> DAY {game.day}</span><h1 id="artist-profile-title">{game.artist.name}</h1><p>{game.artist.handle} · {game.artist.genre} · from {game.artist.origin}</p><span className="profile-location"><MapPin size={13}/> {game.currentLocation}, {game.currentCity}</span></div><div className="profile-tier"><span>CURRENT TIER</span><strong>{tier}</strong><small>REPUTATION {game.reputation}/100</small></div></div><div className="profile-stat-rack"><div><CircleDollarSign size={15}/><span>CASH</span><b>{money(game.money)}</b></div><div><Banknote size={15}/><span>BANK</span><b>{money(game.bank)}</b></div><div className="stat-highlight"><Star size={15}/><span>NET WORTH</span><b>{money(netWorth)}</b></div><div><Users size={15}/><span>FANS</span><b>{short(game.fans)}</b></div></div><div className="profile-progress-panel"><div className="profile-progress-copy"><div><span className="studio-kicker">NEXT CAREER MARK <i>//</i> {nextMilestone.key.toUpperCase()}</span><h2>{nextMilestone.label}</h2><p>{nextMilestone.detail}</p></div><strong>{nextMilestone.display}</strong></div><div className="profile-progress-track"><i style={{ width: `${progress}%` }}/><span style={{ left: `${progress}%` }}/></div><div className="profile-progress-foot"><span>{progress}% complete from live game data</span>{nextTier && <span>Next tier: {nextTier} reputation</span>}</div></div><div className="profile-body-grid"><div className="profile-milestones"><div className="profile-section-heading"><span className="studio-kicker">CAREER MILESTONES</span><small>NO FICTION · JUST YOUR SAVE</small></div>{milestones.map((milestone) => { const done = milestone.current >= milestone.target; const amount = Math.min(milestone.current, milestone.target); const width = Math.round(amount / milestone.target * 100); const Icon = milestone.icon; return <article className={`profile-milestone ${done ? 'is-complete' : ''}`} key={milestone.key}><span className="milestone-icon"><Icon size={15}/></span><div><strong>{milestone.label}</strong><p>{milestone.detail}</p><div className="milestone-meter"><i style={{ width: `${width}%` }}/></div><small>{milestone.display}{done ? ' · COMPLETE' : ''}</small></div></article>; })}</div><div className="profile-history"><div className="profile-section-heading"><span className="studio-kicker">ACTIVITY LOG</span><small>{game.history.length} SAVED ENTRIES</small></div>{game.history.slice(0, 5).map((entry) => <article className="profile-history-entry" key={entry.id}><span className="history-day">D{entry.day}</span><div><strong>{entry.title}</strong><p>{entry.detail}</p><small>{entry.time}</small></div></article>)}{!game.history.length && <p className="profile-empty"><History size={16}/> Your next choice starts the log.</p>}</div></div><div className="profile-footer-line"><span>MONTHLY LISTENERS <b>{short(game.monthlyListeners)}</b></span><span>HYPE <b>{game.hype}%</b></span><span>CREATIVITY <b>{game.creativity}%</b></span><Link href="/career?tab=music" className="profile-analytics-link">RELEASED SONGS &amp; ANALYTICS <ArrowUpRight size={13}/></Link><Link href="/studio" className="profile-studio-link">OPEN STUDIO <ArrowUpRight size={13}/></Link></div></section>;
}
