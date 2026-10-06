'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowRight, ArrowUpRight, Bell, BedDouble, CalendarDays, Check, ChevronRight, CircleDollarSign, Compass, Flame, Heart, MapPin, Music2, ScrollText, Sparkles, Star, Sun, Smartphone, Users, Wallet, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Phone from '@/components/Phone';
import { LagosMapSketch } from '@/components/PhoneScreens';
import WorldRoom from '@/components/WorldRoom';
import { CAMPAIGN_PLANS, opportunityBlockReason, type Opportunity, type Song } from '@/lib/game-rules';
import { useGame } from '@/lib/game';

type PanelKey = 'studio' | 'career' | 'world' | 'music' | 'team' | 'settings' | 'notifications' | 'profile' | 'shop' | 'history';

const cities = [
  { name: 'Lagos', tag: 'Your roots · Afrofusion', accent: 'COAST · WEST AFRICA' },
  { name: 'London', tag: 'New voices · UK garage', accent: 'CITY · UNITED KINGDOM' },
  { name: 'New York', tag: 'Late nights · everywhere', accent: 'CITY · UNITED STATES' },
  { name: 'Los Angeles', tag: 'Sessions · sun all year', accent: 'CITY · UNITED STATES' },
  { name: 'Atlanta', tag: '808s · Seyi’s late session', accent: 'CITY · UNITED STATES' },
  { name: 'Toronto', tag: 'After hours · R&B', accent: 'CITY · CANADA' },
  { name: 'Accra', tag: 'Highlife · new energy', accent: 'COAST · GHANA' },
  { name: 'Johannesburg', tag: 'Amapiano · open doors', accent: 'CITY · SOUTH AFRICA' },
  { name: 'Paris', tag: 'New scenes · art after dark', accent: 'CITY · FRANCE' },
  { name: 'Tokyo', tag: 'Neon nights · new perspective', accent: 'CITY · JAPAN' },
  { name: 'Seoul', tag: 'Bright stages · sharp sounds', accent: 'CITY · SOUTH KOREA' },
  { name: 'Dubai', tag: 'Big rooms · wide horizons', accent: 'CITY · UAE' },
];

const money = (value: number) => `${value >= 0 ? '+' : '−'}$${Math.abs(value).toLocaleString()}`;
const cash = (value: number) => `$${Math.round(value).toLocaleString()}`;
const short = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : `${Math.round(value / 1000)}K`;
const getCityDescription = (city: string) => city === 'Atlanta'
  ? 'A low ceiling, a late beat, and Seyi’s loft across the street. This city asks what happens when you make room for somebody else.'
  : city === 'Lagos'
    ? 'The rain is easing over the city. Teo found a new pocket for the hook, and the evening is still yours to shape.'
    : `${city} has its own rhythm tonight. The apartment is new, the next conversation is yours to begin.`;

function Panel({ kind, close }: { kind: PanelKey; close: () => void }) {
  const game = useGame();
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const contents: Record<PanelKey, { kicker: string; title: string; sub: string }> = {
    studio: { kicker: 'THE RED-LIGHT ROOM', title: 'Make something honest.', sub: 'Build a song in stages—from the first feeling to a finished release plan.' },
    career: { kicker: 'PEOPLE ARE CALLING', title: 'The next move is yours.', sub: 'Every offer has one set of requirements, costs and rewards. Check the city and deadline before you say yes.' },
    world: { kicker: 'CITIES WITH A PULSE', title: 'Where to next?', sub: 'Lagos is home. Atlanta is the first contrasting scene—with a local session that only exists there.' },
    music: { kicker: 'YOUR CATALOGUE', title: 'Songs carry the story.', sub: 'Ideas become demos, masters, scheduled releases, and then a living catalog.' },
    team: { kicker: 'YOUR PEOPLE', title: 'Good things travel together.', sub: 'Reply, commit to a session, offer help, or politely protect your time.' },
    settings: { kicker: 'PLAYER OPTIONS', title: 'Make it yours.', sub: 'Your story lives in this browser.' },
    notifications: { kicker: 'WHILE YOU WERE OUT', title: 'A little movement.', sub: 'These are recent notifications. Important choices are saved in the activity history.' },
    profile: { kicker: 'ARTIST PROFILE', title: game.artist.name, sub: `${game.artist.genre} · From ${game.artist.origin}, currently in ${game.currentCity}.` },
    shop: { kicker: 'THE BOUTIQUE', title: 'Wear the next era.', sub: 'Small details change how a room meets you.' },
    history: { kicker: 'YOUR STORY SO FAR', title: 'The moments that moved you.', sub: 'A persistent log of choices and game-day recaps.' },
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
    <motion.section ref={dialogRef} className="game-panel" role="dialog" aria-modal="true" aria-labelledby="panel-title" aria-describedby="panel-description" initial={{ opacity: 0, y: 20, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: .99 }} transition={{ duration: .2 }}>
      <div className="panel-head"><div><div className="eyebrow" style={{ color: '#b16d48' }}>{meta.kicker}</div><h2 id="panel-title">{meta.title}</h2><p id="panel-description" className="panel-sub">{meta.sub}</p></div><button ref={closeRef} className="close-button" onClick={close} aria-label="Close dialog"><X size={17}/></button></div>
      <div className="panel-content">
        {kind === 'studio' && <>
          <div className="object-stage"><div className="stage-quote">“The hook arrives before the words do.”</div></div>
          <div className="studio-quick-facts"><div><span>CASH</span><b>${game.money.toLocaleString()}</b></div><div><span>ENERGY</span><b>{game.energy}%</b></div><div><span>IDEAS IN PROGRESS</span><b>{game.songs.filter((song) => song.status !== 'RELEASED' && song.status !== 'ARCHIVED').length}</b></div></div>
          <p className="panel-copy">Make ideas, demos, finished masters, and release plans in one focused workspace. Every cost is shown before you commit.</p>
          <Link className="pill-button orange studio-open-link" href="/studio" onClick={close}>OPEN THE DETAILED MUSIC STUDIO <ArrowUpRight size={14}/></Link>
          <div className="panel-song-list">{game.songs.filter((song) => song.status !== 'ARCHIVED').slice(0, 3).map((song) => <SongSummary key={song.id} song={song}/>)}</div>
        </>}
        {kind === 'career' && <>
          <div className="object-stage"><div className="stage-quote">One good room can change the shape of a year.</div></div>
          {game.opportunities.length ? game.opportunities.map((offer) => <OpportunityRow key={offer.id} item={offer}/>) : <div className="quote-note">Your calendar is clear for a moment. Make a song, meet someone, or let the city surprise you.</div>}
          <div className="mini-stat-grid"><div className="mini-stat"><span>REPUTATION</span><b>{game.reputation}/100</b></div><div className="mini-stat"><span>HYPE</span><b>{game.hype}%</b></div><div className="mini-stat"><span>OPEN CONVERSATIONS</span><b>{game.relationships.length}</b></div></div>
        </>}
        {kind === 'world' && <>
          {game.currentCity === 'Lagos' ? <div className="panel-local-map"><div><div className="eyebrow">YABA → LAGOS ISLAND · READY NOW</div><p>Tap a stop to walk there. This map is drawn in the app and updates your saved location, time, and energy.</p></div><LagosMapSketch onWalk={(place) => game.travelLocally(place, 'walk')}/></div> : <div className="quote-note panel-nonlagos-map"><div className="eyebrow">YOUR LAGOS NEIGHBORHOOD</div><p>The local map is waiting back in Lagos. Your {game.currentCity} room stays saved while you travel.</p><button className="pill-button orange" onClick={() => game.travel('Lagos')}>RETURN TO LAGOS · $420 + 15 ENERGY</button></div>}
          <div className="quote-note city-distinction-note"><b>{game.currentCity === 'Atlanta' ? 'ATLANTA · THE LOCAL SCENE' : 'LAGOS · YOUR HOME SCENE'}</b><p>{game.currentCity === 'Atlanta' ? 'Seyi Vibe’s late session is here. The collaboration opportunity is only valid in Atlanta; the city changes what you can do, not just the label on the map.' : 'The Lagos Music Festival and Teo Park’s finishing room are local. Travel costs $420 cash and 15 energy; your save and relationships travel with you.'}</p></div>
          <div className="city-grid">{cities.map((city) => <article className="city-card" key={city.name}><div><div className="eyebrow" style={{ color: '#f6c28d' }}>{city.accent}</div><h3>{city.name}</h3><p>{city.tag}</p></div><button disabled={city.name === game.currentCity || game.money < 420 || game.energy < 15} onClick={() => game.travel(city.name)}>{city.name === game.currentCity ? 'YOU ARE HERE' : 'TRAVEL · $420 + 15 ENERGY'}</button></article>)}</div>
        </>}
        {kind === 'music' && <>
          <div className="map-strip"><div className="map-pin p1"/><div className="map-pin p2"/><div className="map-pin p3"/><div className="map-label">{game.monthlyListeners.toLocaleString()} MONTHLY LISTENERS</div></div>
          <div className="mini-stat-grid"><div className="mini-stat"><span>MONTHLY LISTENERS</span><b>{short(game.monthlyListeners)}</b></div><div className="mini-stat"><span>AUDIENCE</span><b>{short(game.fans)}</b></div><div className="mini-stat"><span>PROJECTED ROYALTIES</span><b>{cash(projectedRoyalties(game.songs, game.fans, game.hype))}/DAY</b></div></div>
          <div className="panel-song-list">{game.songs.map((song) => <SongSummary key={song.id} song={song}/>)}</div>
          <Link className="pill-button orange studio-open-link" href="/studio" onClick={close}>OPEN MUSIC CREATION & RELEASE PLANNER <ArrowUpRight size={14}/></Link>
          <p className="panel-footnote">Royalties shown above are a modelled daily estimate, not cash already earned. End the in-game day to settle actual streams to your ledger.</p>
        </>}
        {kind === 'team' && <>{game.relationships.map((person) => <div className="person-row person-row-choices" key={person.name}><div className="avatar-bubble">{person.avatar}</div><div className="song-main"><b>{person.name}</b><span>{person.role} · Trust {person.trust}</span><div className="meter-line" style={{ marginTop: 8 }}><i style={{ width: `${person.trust}%` }}/></div><div className="person-note">{person.note}</div><div className="person-actions"><button className="pill-button small" onClick={() => game.messagePerson(person.name, 'reply')}>REPLY · FREE</button><button className="pill-button ghost small" disabled={person.name === 'Teo Park' && game.currentCity !== 'Lagos' || game.money < 210 || game.energy < 12} onClick={() => game.messagePerson(person.name, 'accept-session')}>SESSION · $210</button><button className="pill-button ghost small" disabled={game.energy < 8} onClick={() => game.messagePerson(person.name, 'help')}>HELP · 8 ENERGY</button><button className="text-button" onClick={() => game.messagePerson(person.name, 'decline')}>PASS POLITELY</button></div></div></div>)}</>}
        {kind === 'notifications' && <>{game.notifications.map((note, index) => <div className="opportunity" key={`${note}-${index}`}><div className="opp-sigil"><Bell size={16}/></div><div className="opp-copy"><div className="opp-title">{note}</div><div className="opp-detail">Recent notification · {index === 0 ? 'just now' : `${index + 1} in your history`}</div></div><ChevronRight size={16} color="#988b83"/></div>)}<button className="pill-button ghost" onClick={() => { close(); window.setTimeout(() => window.dispatchEvent(new CustomEvent('open-treblr-history')), 30); }}>OPEN PERSISTENT ACTIVITY HISTORY</button></>}
        {kind === 'history' && <>{game.history.length ? game.history.map((entry) => <article className="history-entry" key={entry.id}><div className="history-marker"><Activity size={13}/></div><div><div className="history-entry-meta">DAY {entry.day} · {entry.time}</div><b>{entry.title}</b><p>{entry.detail}</p></div></article>) : <div className="quote-note">Your next choice will start the activity history.</div>}<div className="history-empty-note">The activity log is saved with your local game progress.</div></>}
        {kind === 'profile' && <><div className="object-stage"><div className="stage-quote">Your sound. Your pace. Your next city.</div></div><div className="mini-stat-grid"><div className="mini-stat"><span>AUDIENCE</span><b>{short(game.fans)}</b></div><div className="mini-stat"><span>MONTHLY LISTENERS</span><b>{short(game.monthlyListeners)}</b></div><div className="mini-stat"><span>REPUTATION</span><b>{game.reputation}</b></div></div><div className="quote-note">{game.artist.name} is a {game.artist.genre.toLowerCase()} artist. Born in {game.artist.origin}; currently in {game.currentCity}.</div></>}
        {kind === 'shop' && <>{['Studio headphones', 'Tour-ready jacket', 'Worn-in stage boots'].map((item, index) => { const price = [320, 550, 240][index]; return <div className="person-row" key={item}><div className="song-art"><Star size={18}/></div><div className="song-main"><b>{item}</b><span>Looks good on the way to somewhere.</span></div><button className="pill-button small" disabled={game.money < price} onClick={() => game.spend(price, `Boutique · ${item}`)}>${price}</button></div>; })}</>}
        {kind === 'settings' && <><div className="quote-note">Your progress is saved on this device. This story starts in Lagos with Candelar and the first-week chapter.</div><div className="person-row"><div className="opp-sigil"><Sparkles size={18}/></div><div className="song-main"><b>Start a new story</b><span>Reset the local game save to the original Candelar scenario.</span></div><button className="pill-button small" onClick={() => { if (window.confirm('Start a new story? This will clear the saved progress in this browser.')) { game.reset(); close(); } }}>RESET</button></div><div className="quote-note">TREBLR is a fictional simulation. Social accounts, streams and listeners are in-game and are not connected to real services.</div></>}
      </div>
    </motion.section>
  </div>;
}

function OpportunityRow({ item }: { item: Opportunity }) {
  const game = useGame();
  const blocked = opportunityBlockReason(item, game);
  const rewards = [
    item.effects.cash ? `${money(item.effects.cash)} cash` : '',
    item.effects.fans ? `+${item.effects.fans.toLocaleString()} fans` : '',
    item.effects.hype ? `${item.effects.hype > 0 ? '+' : ''}${item.effects.hype} hype` : '',
    item.effects.reputation ? `${item.effects.reputation > 0 ? '+' : ''}${item.effects.reputation} rep` : '',
  ].filter(Boolean).join(' · ');
  return <div className="opportunity"><div className="opp-sigil" style={item.tone === 'rose' ? { background: '#f6e4e1', color: '#9d4d46' } : item.tone === 'blue' ? { background: '#e4edf1', color: '#456c7a' } : undefined}>{item.type.includes('LIVE') ? <Star size={17}/> : item.type.includes('CAREER') ? <ArrowUpRight size={17}/> : <Heart size={17}/>}</div><div className="opp-copy"><div className="opp-meta">{item.type} · THROUGH DAY {item.expiresOnDay}{item.city ? ` · ${item.city}` : ''}</div><div className="opp-title">{item.title}</div><p className="opp-detail">{item.detail}</p><div className="opp-reward">{rewards || 'An opportunity to grow your reach'}</div><div className={`opp-requirement ${blocked ? 'blocked' : ''}`}>{blocked || `Cost ${money(-item.cost)}${item.effects.energy ? ` · ${item.effects.energy > 0 ? '+' : ''}${item.effects.energy} energy` : ''}`}</div></div><button className="pill-button small" disabled={Boolean(blocked)} title={blocked ?? 'Accept opportunity'} onClick={() => game.acceptOpportunity(item.id)}>{blocked ? item.city && item.city !== game.currentCity ? 'TRAVEL FIRST' : 'LOCKED' : 'SAY YES'}</button></div>;
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
    if (key === 'studio') { window.location.assign('/studio'); return; }
    if (key === 'history') { setPanel('history'); return; }
    setPanel(key === 'world' ? 'world' : key === 'music' ? 'music' : 'career');
  };
  const cityOverlay: Record<string, string> = {
    Lagos: 'linear-gradient(132deg,rgba(63,37,45,.12),rgba(235,132,83,.16))',
    Atlanta: 'linear-gradient(132deg,rgba(24,40,64,.34),rgba(202,126,72,.2))',
    London: 'linear-gradient(132deg,rgba(50,61,81,.36),rgba(173,157,149,.12))',
    Tokyo: 'linear-gradient(132deg,rgba(31,48,83,.35),rgba(214,83,107,.19))',
  };
  const fanLabel = short(game.fans);
  const scenePrompt = game.currentCity === 'Atlanta' ? 'Seyi’s session is open tonight' : game.opportunities.some((offer) => !opportunityBlockReason(offer, game)) ? 'An opportunity is ready for you' : game.songs.some((song) => song.status === 'FINISHED') ? 'A master is ready to release' : `Day ${game.day} is still yours to shape`;

  return <main className="game-shell">
    <div className="world-plate" data-city={game.currentCity}/>
    <div className="world-vignette"/>
    <div className="game-ui">
      <header className="game-header">
        <div className="brand-lockup"><div className="brand-mark">T.</div><div><div className="brand-word">TREBLR</div><div className="eyebrow brand-subline">LIFE IN THE MUSIC</div></div></div>
        <div className="world-chip"><MapPin size={13} color="#ffc48a"/><span>{game.currentCity}</span><i className="chip-separator"/><span>DAY {game.day} · {game.time}</span><i className="chip-separator"/><span>{game.weather.split('·')[0].trim()}</span></div>
        <div className="header-right"><button className="icon-button" aria-label={`Open notifications, ${game.notifications.length} recent`} onClick={() => setPanel('notifications')}><Bell size={17}/></button><button className="icon-button" aria-label="Open activity history" onClick={() => setPanel('history')}><ScrollText size={16}/></button><button className="avatar-menu" onClick={() => setPanel('profile')}><span className="avatar-bubble">C</span><span>{game.artist.name}</span></button></div>
      </header>
      <WorldRoom city={game.currentCity} currentLocation={game.currentLocation} onInteract={interact}/>
      <div className="scene-title"><div className="scene-kicker eyebrow"><i/> {game.currentLocation.toUpperCase()} · DAY {game.day} <Sun size={12}/></div><h1>Make a life<br/>that sounds<br/><em>{game.currentCity === 'Lagos' ? 'like you.' : `like ${game.currentCity}.`}</em></h1><p>{getCityDescription(game.currentCity)}</p></div>
      <button className="scene-prompt" onClick={() => setPanel(game.currentCity === 'Atlanta' ? 'career' : 'career')} aria-label={`Open opportunity: ${scenePrompt}`}><span className="pulse-dot"/>{scenePrompt}<ChevronRight size={13}/></button>
      <div className="bottom-stage"><div className="quick-status">
        <div className="status-pill"><Heart className="status-icon" size={15}/><div><div className="status-label">ENERGY</div><div className="status-value">{game.energy}%</div><div className="status-meter"><i style={{ width: `${game.energy}%` }}/></div></div></div>
        <div className="status-pill"><Sparkles className="status-icon" size={15}/><div><div className="status-label">MOOD</div><div className="status-value">{game.mood > 78 ? 'In a good place' : game.mood > 48 ? 'Finding the groove' : 'Need a breather'}</div></div></div>
        <div className="status-pill"><Flame className="status-icon" size={15}/><div><div className="status-label">HYPE</div><div className="status-value">{game.hype}%</div><div className="status-meter"><i style={{ width: `${game.hype}%` }}/></div></div></div>
        <div className="status-pill money-pill"><Wallet className="status-icon" size={15}/><div><div className="status-label">CASH · BANK</div><div className="status-value">${game.money.toLocaleString()} <span className="bank-inline">· ${(game.bank / 1000).toFixed(0)}K</span></div></div></div>
        <div className="status-pill audience-pill"><Users className="status-icon" size={15}/><div><div className="status-label">AUDIENCE</div><div className="status-value">{fanLabel} fans</div></div></div>
      </div><div className="stage-nudge-wrap"><p className="stage-nudge">A day of streams, income and deadlines moves together.</p><button className="pill-button small stage-day-button" onClick={game.advanceDay}><Check size={12}/> END DAY · DAY {game.day}</button></div></div>
    </div>
    <nav className="bottom-nav" aria-label="Game navigation">
      <button className="nav-item active" onClick={() => openNav('home')}><BedDouble/><span>HOME</span></button>
      <button className="nav-item" onClick={() => openNav('world')}><Compass/><span>WORLD</span></button>
      <button className="nav-item nav-create" onClick={() => openNav('studio')}><Music2/><span>CREATE</span></button>
      <button className="nav-item" onClick={() => openNav('music')}><Activity/><span>MUSIC</span></button>
      <button className="nav-item" onClick={() => openNav('career')}><CalendarDays/><span>CAREER</span></button>
      <button className={`nav-item phone-nav${phoneOpen ? ' is-open' : ''}`} onClick={() => openNav('phone')} aria-expanded={phoneOpen} aria-controls="in-game-phone"><Smartphone size={18} strokeWidth={1.8}/><span>PHONE</span></button>
    </nav>
    <Phone open={phoneOpen} setOpen={setPhoneOpen} onPanel={(value) => { setPhoneOpen(false); setPanel(value as PanelKey); }}/>
    <AnimatePresence>{panel && <Panel key={panel} kind={panel} close={() => setPanel(null)}/>}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="toast" role="status" aria-live="polite" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>{toast}</motion.div>}</AnimatePresence>
  </main>;
}
