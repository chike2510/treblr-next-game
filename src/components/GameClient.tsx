'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowRight, ArrowUpRight, Bell, BedDouble, CalendarDays, Check, ChevronRight, CircleDollarSign, Compass, Flame, Heart, MapPin, Music2, ScrollText, Sparkles, Star, Sun, Smartphone, Users, Wallet, X, Moon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Phone from '@/components/Phone';
import { LagosMapSketch } from '@/components/PhoneScreens';
import WorldRoom, { roomSpots } from '@/components/WorldRoom';
import { CAMPAIGN_PLANS, opportunityBlockReason, type Opportunity, type Song } from '@/lib/game-rules';
import { useGame } from '@/lib/game';
import { CITIES, TRAVEL_CASH, TRAVEL_ENERGY, cityByName } from '@/lib/cities';
import { CashIcon, EnergyIcon } from '@/components/CostChips';

type PanelKey = 'studio' | 'career' | 'world' | 'music' | 'team' | 'settings' | 'notifications' | 'profile' | 'shop' | 'history';


const money = (value: number) => `${value >= 0 ? '+' : '−'}$${Math.abs(value).toLocaleString()}`;
const cash = (value: number) => `$${Math.round(value).toLocaleString()}`;
const short = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : `${Math.round(value / 1000)}K`;
function Panel({ kind, close }: { kind: PanelKey; close: () => void }) {
  const game = useGame();
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const contents: Record<PanelKey, { kicker: string; title: string; sub: string }> = {
    studio: { kicker: 'THE RED-LIGHT ROOM', title: 'Studio', sub: 'Build a song in stages—from the first feeling to a finished release plan.' },
    career: { kicker: 'PEOPLE ARE CALLING', title: 'Offers', sub: 'Every offer has one set of requirements, costs and rewards. Check the city and deadline before you say yes.' },
    world: { kicker: 'CITIES WITH A PULSE', title: 'Departures', sub: 'Lagos is home. Atlanta is the first contrasting scene—with a local session that only exists there.' },
    music: { kicker: 'YOUR CATALOGUE', title: 'Your music', sub: 'Ideas become demos, masters, scheduled releases, and then a living catalog.' },
    team: { kicker: 'YOUR PEOPLE', title: 'Your people', sub: 'Reply, commit to a session, offer help, or politely protect your time.' },
    settings: { kicker: 'PLAYER OPTIONS', title: 'Settings', sub: '' },
    notifications: { kicker: 'WHILE YOU WERE OUT', title: 'Notifications', sub: 'These are recent notifications. Important choices are saved in the activity history.' },
    profile: { kicker: 'ARTIST PROFILE', title: game.artist.name, sub: `${game.artist.genre} · From ${game.artist.origin}, currently in ${game.currentCity}.` },
    shop: { kicker: 'THE BOUTIQUE', title: 'Boutique', sub: 'Small details change how a room meets you.' },
    history: { kicker: 'YOUR STORY SO FAR', title: 'Your story', sub: 'A persistent log of choices and game-day recaps.' },
  };
  const meta = contents[kind];
  useEffect(() => {
    returnFocus.current = document.activeElement as HTMLElement;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
        if (!focusable.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = bodyOverflow; returnFocus.current?.focus(); };
  }, [close]);

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <motion.section ref={dialogRef} className="game-panel" role="dialog" aria-modal="true" aria-labelledby="panel-title" initial={{ opacity: 0, y: 20, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: .99 }} transition={{ duration: .2 }}>
      <div className="panel-head"><div><h2 id="panel-title">{meta.title}</h2></div><button ref={closeRef} className="close-button" onClick={close} aria-label="Close dialog"><X size={17}/></button></div>
      <div className="panel-content">
        {kind === 'studio' && <>
          <div className="studio-quick-facts"><div><span>CASH</span><b>${game.money.toLocaleString()}</b></div><div><span>ENERGY</span><b>{game.energy}%</b></div><div><span>IDEAS IN PROGRESS</span><b>{game.songs.filter((song) => song.status !== 'RELEASED' && song.status !== 'ARCHIVED').length}</b></div></div>
          <Link className="btn-primary studio-open-link" href="/studio" onClick={close}>Open studio <ArrowUpRight size={15}/></Link>
          <div className="panel-song-list">{game.songs.filter((song) => song.status !== 'ARCHIVED').slice(0, 3).map((song) => <SongSummary key={song.id} song={song}/>)}</div>
        </>}
        {kind === 'career' && <>
          {game.opportunities.length ? <div className="offer-stack">{game.opportunities.map((offer) => <OfferCard key={offer.id} item={offer}/>)}</div> : <div className="empty-note">No offers right now. Make a song or meet someone.</div>}
          <div className="mini-stat-grid"><div className="mini-stat"><span>REPUTATION</span><b>{game.reputation}/100</b></div><div className="mini-stat"><span>HYPE</span><b>{game.hype}%</b></div><div className="mini-stat"><span>CONTACTS</span><b>{game.relationships.length}</b></div></div>
        </>}
        {kind === 'world' && <>
          <Postcard city={game.currentCity} location={game.currentLocation}/>
          {game.currentCity === 'Lagos' && <div className="panel-local-map"><div><b className="board-title">Walk Lagos</b><p>Yaba to Lagos Island. Tap a stop to walk there.</p></div><LagosMapSketch onWalk={(place) => game.travelLocally(place, 'walk')}/></div>}
          <div className="board" role="table" aria-label={`Departures from ${game.currentCity}`}>
            <div className="board-head" role="row"><span role="columnheader">Dest</span><span role="columnheader">City</span><span role="columnheader" className="board-scene-h">Scene</span><span role="columnheader">Fare</span><span role="columnheader"><span className="sr-only">Action</span></span></div>
            {CITIES.filter((city) => city.name !== game.currentCity).map((city) => { const cantAfford = game.money < TRAVEL_CASH || game.energy < TRAVEL_ENERGY; return <div className="board-row" role="row" key={city.name}>
              <span role="cell" className="board-code mono">{city.code}</span>
              <span role="cell" className="board-city">{city.name}</span>
              <span role="cell" className="board-scene">{city.scene}</span>
              <span role="cell" className="board-fare"><CostChips cash={TRAVEL_CASH} energy={TRAVEL_ENERGY}/></span>
              <span role="cell"><button type="button" className="btn-board" disabled={cantAfford} title={cantAfford ? 'Not enough cash or energy' : `Fly to ${city.name}`} onClick={() => game.travel(city.name)}>{cantAfford ? 'Short' : 'Fly'}</button></span>
            </div>; })}
          </div>
        </>}
        {kind === 'music' && <>
          <div className="mini-stat-grid"><div className="mini-stat"><span>LISTENERS / MO</span><b>{short(game.monthlyListeners)}</b></div><div className="mini-stat"><span>FANS</span><b>{short(game.fans)}</b></div><div className="mini-stat"><span>EST. ROYALTIES</span><b>{cash(projectedRoyalties(game.songs, game.fans, game.hype))}/day</b></div></div>
          <ol className="tracklist">{game.songs.map((song, index) => <TrackRow key={song.id} song={song} index={index + 1}/>)}</ol>
          <Link className="btn-primary studio-open-link" href="/studio" onClick={close}>Open studio <ArrowUpRight size={15}/></Link>
        </>}
        {kind === 'team' && <>{game.relationships.map((person) => <div className="person-row person-row-choices" key={person.name}><div className="avatar-bubble">{person.avatar}</div><div className="song-main"><b>{person.name}</b><span>{person.role} · Trust {person.trust}</span><div className="meter-line" style={{ marginTop: 8 }}><i style={{ width: `${person.trust}%` }}/></div><div className="person-note">{person.note}</div><div className="person-actions"><button className="pill-button small" onClick={() => game.messagePerson(person.name, 'reply')}>Reply</button><button className="pill-button ghost small" disabled={person.name === 'Teo Park' && game.currentCity !== 'Lagos' || game.money < 210 || game.energy < 12} onClick={() => game.messagePerson(person.name, 'accept-session')}>Session · $210</button><button className="pill-button ghost small" disabled={game.energy < 8} onClick={() => game.messagePerson(person.name, 'help')}>Help · 8 energy</button><button className="text-button" onClick={() => game.messagePerson(person.name, 'decline')}>Pass</button></div></div></div>)}</>}
        {kind === 'notifications' && <>{game.notifications.map((note, index) => <div className="opportunity" key={`${note}-${index}`}><div className="opp-sigil"><Bell size={16}/></div><div className="opp-copy"><div className="opp-title">{note}</div><div className="opp-detail">Recent notification · {index === 0 ? 'just now' : `${index + 1} in your history`}</div></div><ChevronRight size={16} color="#988b83"/></div>)}<button className="pill-button ghost" onClick={() => { close(); window.setTimeout(() => window.dispatchEvent(new CustomEvent('open-treblr-history')), 30); }}>Open your story</button></>}
        {kind === 'history' && <>{game.history.length ? game.history.map((entry) => <article className="history-entry" key={entry.id}><div className="history-marker"><Activity size={13}/></div><div><div className="history-entry-meta">DAY {entry.day} · {entry.time}</div><b>{entry.title}</b><p>{entry.detail}</p></div></article>) : <div className="quote-note">Your next choice will start the activity history.</div>}</>}
        {kind === 'profile' && <><div className="mini-stat-grid"><div className="mini-stat"><span>AUDIENCE</span><b>{short(game.fans)}</b></div><div className="mini-stat"><span>MONTHLY LISTENERS</span><b>{short(game.monthlyListeners)}</b></div><div className="mini-stat"><span>REPUTATION</span><b>{game.reputation}</b></div></div><div className="quote-note">{game.artist.name} is a {game.artist.genre.toLowerCase()} artist. Born in {game.artist.origin}; currently in {game.currentCity}.</div></>}
        {kind === 'shop' && <>{['Studio headphones', 'Tour-ready jacket', 'Worn-in stage boots'].map((item, index) => { const price = [320, 550, 240][index]; return <div className="person-row" key={item}><div className="song-art"><Star size={18}/></div><div className="song-main"><b>{item}</b><span>{['Closed-back, studio grade', 'Heavy denim, tour ready', 'Worn-in leather'][index]}</span></div><button className="pill-button small" disabled={game.money < price} onClick={() => game.spend(price, `Boutique · ${item}`)}>${price}</button></div>; })}</>}
        {kind === 'settings' && <><div className="person-row"><div className="opp-sigil"><Sparkles size={18}/></div><div className="song-main"><b>Start a new story</b><span>Back to day 1 in Lagos with Candelar.</span></div><button className="pill-button small" onClick={() => { if (window.confirm('Start a new story? This will clear the saved progress in this browser.')) { game.reset(); close(); } }}>Reset</button></div><div className="empty-note">TREBLR is fiction. Your save lives on this device, and no social account, stream or listener here is real.</div></>}
      </div>
    </motion.section>
  </div>;
}

function OfferCard({ item }: { item: Opportunity }) {
  const game = useGame();
  const blocked = opportunityBlockReason(item, game);
  const gains = [
    item.effects.cash && item.effects.cash > 0 ? { key: 'cash', label: money(item.effects.cash) } : null,
    item.effects.fans ? { key: 'fans', label: `+${short(item.effects.fans)} fans` } : null,
    item.effects.hype ? { key: 'hype', label: `${item.effects.hype > 0 ? '+' : ''}${item.effects.hype} hype` } : null,
    item.effects.reputation ? { key: 'rep', label: `${item.effects.reputation > 0 ? '+' : ''}${item.effects.reputation} rep` } : null,
  ].filter(Boolean) as { key: string; label: string }[];
  const energyCost = item.effects.energy && item.effects.energy < 0 ? -item.effects.energy : 0;
  const label = blocked ? item.city && item.city !== game.currentCity ? 'Travel first' : 'Locked' : 'Take it';
  return <article className={`offer-card offer-${item.tone ?? 'gold'}`}>
    <header className="offer-top"><span className="offer-type">{item.type.toLowerCase()}</span><span className="offer-due mono">Until day {item.expiresOnDay}</span></header>
    <h3 className="offer-title">{item.title}</h3>
    <p className="offer-detail">{item.detail}</p>
    <div className="offer-chips">{gains.map((gain) => <span key={gain.key} className="chip chip-gain">{gain.label}</span>)}</div>
    <footer className="offer-foot">
      <CostChips cash={item.cost} energy={energyCost}/>
      {blocked && <span className="offer-blocked">{blocked}</span>}
      <button type="button" className={blocked ? 'btn-secondary' : 'btn-primary'} disabled={Boolean(blocked)} onClick={() => game.acceptOpportunity(item.id)}>{label}</button>
    </footer>
  </article>;
}

function CostChips({ cash: cashCost, energy }: { cash: number; energy: number }) {
  if (!cashCost && !energy) return <span className="chip chip-free">Free</span>;
  return <span className="cost-chips">{cashCost > 0 && <span className="chip chip-cost"><CashIcon/>{cashCost.toLocaleString()}</span>}{energy > 0 && <span className="chip chip-cost"><EnergyIcon/>{energy}</span>}</span>;
}

function Postcard({ city, location }: { city: string; location: string }) {
  const info = cityByName(city);
  return <figure className="postcard" style={{ backgroundImage: `url(${info.image})` }}>
    <figcaption><span className="postcard-code mono">{info.code} · {info.region}</span><span className="postcard-name">{city}</span><span className="postcard-here">You’re at {location}</span></figcaption>
  </figure>;
}

function TrackRow({ song, index }: { song: Song; index: number }) {
  const status = song.status === 'RELEASED' ? 'Live' : song.status === 'SCHEDULED' ? `Out day ${song.releaseDay}` : song.status === 'FINISHED' ? 'Mastered' : song.status.charAt(0) + song.status.slice(1).toLowerCase();
  return <li className={`track track-${song.status.toLowerCase()}`}>
    <span className="track-n mono">{String(index).padStart(2, '0')}</span>
    <span className="track-main"><b>{song.title}</b><span>{song.genre} · {song.bpm} BPM</span></span>
    <span className="track-status">{status}</span>
    <span className="track-num mono">{song.streams ? short(song.streams) : `Q${song.quality}`}</span>
  </li>;
}

function SongSummary({ song }: { song: Song }) {
  return <div className="song-row"><div className="song-art"><Music2 size={17}/></div><div className="song-main"><b>{song.title}</b><span>{song.genre} · {song.bpm} BPM · {song.status.toLowerCase()} · {song.streams ? `${short(song.streams)} streams` : `${song.quality} quality`}{song.releaseDay ? ` · release day ${song.releaseDay}` : ''}</span></div><span className={`quality-badge quality-${song.status.toLowerCase()}`}>{song.status === 'RELEASED' ? 'LIVE' : song.status === 'SCHEDULED' ? 'DATE SET' : song.quality}</span></div>;
}

function projectedRoyalties(songs: Song[], fans: number, hype: number) {
  return songs.filter((song) => song.status === 'RELEASED').reduce((total, song) => total + Math.round((700 + song.quality * 25 + fans * 0.0018 + hype * 18) * 0.003), 0);
}

export default function GameClient() {
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [toast, setToast] = useState('');
  const game = useGame();
  const router = useRouter();
  useEffect(() => { void useGame.persist.rehydrate(); }, []);
  useEffect(() => {
    if (game.lastEvent) { setToast(game.lastEvent); const timer = window.setTimeout(() => { setToast(''); game.dismissEvent(); }, 4300); return () => window.clearTimeout(timer); }
  }, [game.lastEvent, game.dismissEvent]);
  useEffect(() => {
    const openHistory = () => setPanel('history');
    window.addEventListener('open-treblr-history', openHistory);
    return () => window.removeEventListener('open-treblr-history', openHistory);
  }, []);

  const interact = (name: string) => {
    if (name === 'phone') return setPhoneOpen(true);
    if (name === 'bed') return game.advanceDay();
    if (name === 'kitchen') return game.eat();
    if (name === 'studio') return setPanel('studio');
    if (name === 'door' || name === 'car') return setPanel('world');
    if (name === 'laptop' || name === 'computer') return setPanel('career');
    if (name === 'wardrobe') return setPanel('shop');
    if (name === 'local') return setPanel(game.currentCity === 'Atlanta' ? 'career' : 'team');
  };
  const openNav = (key: 'home' | 'world' | 'music' | 'career' | 'phone' | 'studio' | 'history') => {
    if (key === 'home') { setPanel(null); setPhoneOpen(false); return; }
    if (key === 'phone') { setPhoneOpen(true); return; }
    if (key === 'studio') { router.push('/studio'); return; }
    if (key === 'history') { setPanel('history'); return; }
    setPanel(key === 'world' ? 'world' : key === 'music' ? 'music' : 'career');
  };
  const fanLabel = short(game.fans);
  const readyOffer = game.opportunities.some((offer) => !opportunityBlockReason(offer, game));
  const objective: { text: string; panel: PanelKey } = game.currentCity === 'Atlanta'
    ? { text: 'Seyi’s session is open tonight', panel: 'career' }
    : readyOffer ? { text: 'An offer is ready to take', panel: 'career' }
    : game.songs.some((song) => song.status === 'FINISHED') ? { text: 'A master is ready to release', panel: 'music' }
    : { text: `Day ${game.day} is still yours to shape`, panel: 'career' };
  const moodWord = game.mood > 78 ? 'Good' : game.mood > 48 ? 'Steady' : 'Low';
  const spots = roomSpots(game.currentCity);

  return <main className="game-shell">
    <div className="world-plate" data-city={game.currentCity}/>
    <div className="world-vignette"/>
    <WorldRoom city={game.currentCity} currentLocation={game.currentLocation} onInteract={interact}/>
    <div className="hud">
      <header className="hud-top">
        <div className="hud-left">
          <div className="hud-brand"><span className="hud-brand-mark">T.</span><span className="hud-brand-word">TREBLR</span></div>
          <section className="hud-place" aria-label="Where you are">
            <div className="hud-place-where">{game.currentLocation} · {game.currentCity}</div>
            <div className="hud-place-when"><span className="hud-day">Day {game.day}</span><span className="mono">{game.time}</span><span className="hud-weather">{game.weather.split('·')[0].trim()}</span></div>
            <button type="button" className="hud-goal" onClick={() => setPanel(objective.panel)}><span className="hud-goal-dot" aria-hidden="true"/><span>{objective.text}</span><ChevronRight size={14} aria-hidden="true"/></button>
          </section>
        </div>
        <div className="hud-right">
          <dl className="hud-stats" aria-label="Your stats">
            <div className="hud-stat"><dt>Cash</dt><dd className="mono">{cash(game.money)}</dd></div>
            <div className="hud-stat"><dt>Energy</dt><dd className="mono">{game.energy}</dd><i className="hud-bar" aria-hidden="true"><b style={{ width: `${game.energy}%` }}/></i></div>
            <div className="hud-stat"><dt>Hype</dt><dd className="mono">{game.hype}</dd><i className="hud-bar" aria-hidden="true"><b style={{ width: `${game.hype}%` }}/></i></div>
            <div className="hud-stat hud-stat--mood"><dt>Mood</dt><dd>{moodWord}</dd><i className="hud-bar" aria-hidden="true"><b style={{ width: `${game.mood}%` }}/></i></div>
            <div className="hud-stat"><dt>Fans</dt><dd className="mono">{fanLabel}</dd></div>
          </dl>
          <div className="hud-actions">
            <button type="button" className="hud-icon" aria-label={`Open notifications, ${game.notifications.length} recent`} onClick={() => setPanel('notifications')}><Bell size={17}/>{game.notifications.length > 0 && <span className="hud-badge" aria-hidden="true"/>}</button>
            <button type="button" className="hud-icon hud-icon--history" aria-label="Open activity history" onClick={() => setPanel('history')}><ScrollText size={16}/></button>
            <button type="button" className="hud-avatar" aria-label={`Open profile for ${game.artist.name}`} onClick={() => setPanel('profile')}><span>{game.artist.name.charAt(0)}</span></button>
          </div>
        </div>
      </header>
      <div className="hud-bottom">
        <div className="here-tray" aria-label="In the apartment">
          {spots.filter((spot) => spot.id !== 'bed' && spot.id !== 'phone').map(({ id, label, icon: Icon }) => <button type="button" key={id} className="here-chip" onClick={() => interact(id)}><Icon size={15} aria-hidden="true"/>{label}</button>)}
        </div>
        <button type="button" className="btn-primary end-day" onClick={game.advanceDay}><Moon size={15} aria-hidden="true"/>End day {game.day}</button>
      </div>
    </div>
    <nav className="bottom-nav" aria-label="Game navigation">
      <button className="nav-item active" onClick={() => openNav('home')}><BedDouble/><span>Home</span></button>
      <button className="nav-item" onClick={() => openNav('world')}><Compass/><span>World</span></button>
      <button className="nav-item" onClick={() => openNav('studio')}><Music2/><span>Create</span></button>
      <button className="nav-item" onClick={() => openNav('music')}><Activity/><span>Music</span></button>
      <button className="nav-item" onClick={() => openNav('career')}><CalendarDays/><span>Career</span></button>
      <button className={`nav-item phone-nav${phoneOpen ? ' is-open' : ''}`} onClick={() => openNav('phone')} aria-expanded={phoneOpen} aria-controls="in-game-phone"><Smartphone/><span>Phone</span></button>
    </nav>
    <Phone open={phoneOpen} setOpen={setPhoneOpen} onPanel={(value) => { setPhoneOpen(false); setPanel(value as PanelKey); }}/>
    <AnimatePresence>{panel && <Panel key={panel} kind={panel} close={() => setPanel(null)}/>}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="toast" role="status" aria-live="polite" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>{toast}</motion.div>}</AnimatePresence>
  </main>;
}
