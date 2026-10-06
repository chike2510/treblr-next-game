'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Bell, BedDouble, CalendarDays, Check, ChevronRight, CircleDollarSign, Compass, Flame, Heart, MapPin, Music2, Sparkles, Star, Sun, Users, Wallet, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Phone from '@/components/Phone';
import WorldRoom from '@/components/WorldRoom';
import { Opportunity, Song, useGame } from '@/lib/game';

type PanelKey = 'studio' | 'career' | 'world' | 'music' | 'team' | 'settings' | 'notifications' | 'profile' | 'shop';

const cities = [
  { name: 'Lagos', tag: 'Your roots · Afrofusion', accent: 'COAST · WEST AFRICA' },
  { name: 'London', tag: 'New voices · UK garage', accent: 'CITY · UNITED KINGDOM' },
  { name: 'New York', tag: 'Late nights · everywhere', accent: 'CITY · UNITED STATES' },
  { name: 'Los Angeles', tag: 'Sessions · sun all year', accent: 'CITY · UNITED STATES' },
  { name: 'Atlanta', tag: '808s · new collaborators', accent: 'CITY · UNITED STATES' },
  { name: 'Toronto', tag: 'After hours · R&B', accent: 'CITY · CANADA' },
  { name: 'Accra', tag: 'Highlife · new energy', accent: 'COAST · GHANA' },
  { name: 'Johannesburg', tag: 'Amapiano · open doors', accent: 'CITY · SOUTH AFRICA' },
  { name: 'Paris', tag: 'New scenes · art after dark', accent: 'CITY · FRANCE' },
  { name: 'Tokyo', tag: 'Neon nights · new perspective', accent: 'CITY · JAPAN' },
  { name: 'Seoul', tag: 'Bright stages · sharp sounds', accent: 'CITY · SOUTH KOREA' },
  { name: 'Dubai', tag: 'Big rooms · wide horizons', accent: 'CITY · UAE' },
];

function Panel({ kind, close }: { kind: PanelKey; close: () => void }) {
  const game = useGame();
  const [title, setTitle] = useState('Blue Hour, Again');
  const [genre, setGenre] = useState('Afro-fusion');
  const [mood, setMood] = useState('Midnight');
  const [activeMood, setActiveMood] = useState('Midnight');

  const record = () => {
    game.recordSong(title, genre, mood);
  };
  const contents: Record<PanelKey, { kicker: string; title: string; sub: string }> = {
    studio: { kicker: 'THE RED-LIGHT ROOM', title: 'Make something honest.', sub: 'A song isn’t a button. It’s a little bet on what you’re feeling today.' },
    career: { kicker: 'PEOPLE ARE CALLING', title: 'The next move is yours.', sub: 'Every yes costs something. Every no sends the story somewhere else.' },
    world: { kicker: 'CITIES WITH A PULSE', title: 'Where to next?', sub: 'Your roots stay yours. The rest of the map is open.' },
    music: { kicker: 'YOUR CATALOGUE', title: 'Songs carry the story.', sub: 'Demos grow into records. Records find people in every city.' },
    team: { kicker: 'YOUR PEOPLE', title: 'Good things travel together.', sub: 'Trust takes time. A text, a session, a show — it all counts.' },
    settings: { kicker: 'PLAYER OPTIONS', title: 'Make it yours.', sub: 'Your story lives in this browser.' },
    notifications: { kicker: 'WHILE YOU WERE OUT', title: 'A little movement.', sub: 'People, places, and songs keep finding each other.' },
    profile: { kicker: 'ARTIST PROFILE', title: game.artist.name, sub: `${game.artist.genre} · From ${game.artist.origin}, currently in ${game.currentCity}.` },
    shop: { kicker: 'THE BOUTIQUE', title: 'Wear the next era.', sub: 'Small details change how a room meets you.' },
  };
  const meta = contents[kind];
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
    <motion.section className="game-panel" initial={{ opacity: 0, y: 20, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: .99 }} transition={{ duration: .2 }}>
      <div className="panel-head"><div><div className="eyebrow" style={{ color: '#b16d48' }}>{meta.kicker}</div><h2>{meta.title}</h2><p className="panel-sub">{meta.sub}</p></div><button className="close-button" onClick={close} aria-label="Close"><X size={17} /></button></div>
      <div className="panel-content">
        {kind === 'studio' && <>
          <div className="object-stage"><div className="stage-quote">“Sometimes the hook arrives before the words do.”</div></div>
          <label className="form-label">Working title</label><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={44} />
          <div className="field-row"><div><label className="form-label">The sound</label><select className="field" value={genre} onChange={(e) => setGenre(e.target.value)}>{['Afro-fusion', 'Afrobeats', 'Alt R&B', 'UK garage', 'Amapiano', 'Alternative', 'Pop'].map((g) => <option key={g}>{g}</option>)}</select></div><div><label className="form-label">Tempo & feeling</label><select className="field" value={mood} onChange={(e) => setMood(e.target.value)}>{['Midnight', 'Golden hour', 'Restless', 'Hopeful', 'Wistful', 'Unbothered'].map((m) => <option key={m}>{m}</option>)}</select></div></div>
          <div className="form-label" style={{ marginTop: 18 }}>Pull from the day</div><div className="choice-row">{['Something I miss', 'A room at 2am', 'First train out', 'A softer ending'].map((item) => <button key={item} className={`choice ${activeMood === item ? 'selected' : ''}`} onClick={() => { setActiveMood(item); setMood(item === 'First train out' ? 'Restless' : item === 'A softer ending' ? 'Hopeful' : 'Midnight'); }}>{item}</button>)}</div>
          <div className="mini-stat-grid"><div className="mini-stat"><span>STUDIO TIME</span><b>$125</b></div><div className="mini-stat"><span>ENERGY COST</span><b>−18</b></div><div className="mini-stat"><span>CREATIVITY</span><b>{game.creativity}%</b></div></div>
          <button className="pill-button orange" style={{ width: '100%', padding: '14px', marginTop: 18 }} onClick={record}>ROLL TAPE <ArrowUpRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></button>
        </>}
        {kind === 'career' && <>
          <div className="object-stage"><div className="stage-quote">One good room can change the shape of a year.</div></div>
          {game.opportunities.length ? game.opportunities.map((o) => <OpportunityRow key={o.id} item={o} />) : <div className="quote-note">Your calendar is clear for a moment. Make a song, meet someone, or let the city surprise you.</div>}
          <div className="mini-stat-grid"><div className="mini-stat"><span>REPUTATION</span><b>{game.reputation}/100</b></div><div className="mini-stat"><span>HYPE</span><b>{game.hype}%</b></div><div className="mini-stat"><span>NEW MESSAGES</span><b>{game.relationships.length}</b></div></div>
        </>}
        {kind === 'world' && <><div className="map-strip"><div className="map-pin p1"/><div className="map-pin p2"/><div className="map-pin p3"/><div className="map-label">THE WORLD IS LISTENING</div></div><div className="city-grid">{cities.map((city) => <article className="city-card" key={city.name}><div><div className="eyebrow" style={{ color: '#f6c28d' }}>{city.accent}</div><h3>{city.name}</h3><p>{city.tag}</p></div><button onClick={() => game.travel(city.name)}>{city.name === game.currentCity ? 'YOU ARE HERE' : 'TAKE THE NIGHT FLIGHT · $420'}</button></article>)}</div></>}
        {kind === 'music' && <><div className="map-strip"><div className="map-pin p1"/><div className="map-pin p2"/><div className="map-pin p3"/><div className="map-label">{game.monthlyListeners.toLocaleString()} LISTENERS THIS MONTH</div></div><div className="mini-stat-grid"><div className="mini-stat"><span>MONTHLY LISTENERS</span><b>{(game.monthlyListeners / 1000).toFixed(0)}K</b></div><div className="mini-stat"><span>FANS</span><b>{(game.fans / 1000).toFixed(0)}K</b></div><div className="mini-stat"><span>ROYALTIES</span><b>$2,840</b></div></div><div style={{ marginTop: 18 }}>{game.songs.map((song) => <SongRow key={song.id} song={song} release={() => game.releaseSong(song.id)} />)}</div></>}
        {kind === 'team' && <>{game.relationships.map((person) => <div className="person-row" key={person.name}><div className="avatar-bubble">{person.avatar}</div><div className="song-main"><b style={{ fontFamily: 'var(--display)' }}>{person.name}</b><span>{person.role} · Trust {person.trust}</span><div className="meter-line" style={{ marginTop: 8 }}><i style={{ width: `${person.trust}%` }} /></div><div style={{ fontSize: 10, color: '#7d716e', marginTop: 6 }}>{person.note}</div></div><button className="pill-button small" onClick={() => game.messagePerson(person.name)}>TEXT THEM</button></div>)}</>}
        {kind === 'notifications' && <>{game.notifications.map((note, i) => <div className="opportunity" key={`${note}-${i}`}><div className="opp-sigil"><Bell size={16} /></div><div className="opp-copy"><div className="opp-title">{note}</div><div className="opp-detail">A moment from your world · {i === 0 ? 'just now' : `${i + 1}h ago`}</div></div><ChevronRight size={16} color="#988b83" /></div>)}</>}
        {kind === 'profile' && <><div className="object-stage"><div className="stage-quote">Your sound. Your pace. Your next city.</div></div><div className="mini-stat-grid"><div className="mini-stat"><span>FANS</span><b>{(game.fans / 1000).toFixed(0)}K</b></div><div className="mini-stat"><span>MONTHLY LISTENERS</span><b>{(game.monthlyListeners / 1000).toFixed(0)}K</b></div><div className="mini-stat"><span>REPUTATION</span><b>{game.reputation}</b></div></div><div className="quote-note">Candelar is a {game.artist.genre.toLowerCase()} artist. Born in {game.artist.origin}; at home anywhere a good song has room to breathe.</div></>}
        {kind === 'shop' && <>{['Studio headphones', 'Tour-ready jacket', 'Worn-in stage boots'].map((item, i) => <div className="person-row" key={item}><div className="song-art"><Star size={18} /></div><div className="song-main"><b>{item}</b><span>Looks good on the way to somewhere.</span></div><button className="pill-button small" disabled={game.money < [320, 550, 240][i]} onClick={() => { game.spend([320, 550, 240][i]); game.dismissEvent(); }}>${[320, 550, 240][i]}</button></div>)}</>}
        {kind === 'settings' && <><div className="quote-note">Your progress is saved on this device. A new story starts in Lagos with your original artist setup.</div><div className="person-row"><div className="opp-sigil"><Sparkles size={18} /></div><div className="song-main"><b>Start a new story</b><span>Reset the local game save to the original Candelar scenario.</span></div><button className="pill-button small" onClick={() => { if (window.confirm('Start a new story? This will clear the saved progress in this browser.')) { game.reset(); close(); } }}>RESET</button></div><div className="quote-note">TREBLR is an original fictional simulation. Social accounts are in-game worlds and are not connected to real platforms.</div></>}
      </div>
    </motion.section>
  </div>;
}

function OpportunityRow({ item }: { item: Opportunity }) {
  const acceptOpportunity = useGame((s) => s.acceptOpportunity);
  return <div className="opportunity"><div className="opp-sigil" style={item.tone === 'rose' ? { background: '#f6e4e1', color: '#9d4d46' } : item.tone === 'blue' ? { background: '#e4edf1', color: '#456c7a' } : undefined}>{item.type.includes('LIVE') ? <Star size={17} /> : item.type.includes('CAREER') ? <ArrowUpRight size={17} /> : <Heart size={17} />}</div><div className="opp-copy"><div className="opp-meta">{item.type} · {item.deadline}</div><div className="opp-title">{item.title}</div><p className="opp-detail">{item.detail}</p><div className="opp-reward">{item.reward}</div></div><button className="pill-button small" onClick={() => acceptOpportunity(item.id)}>SAY YES</button></div>;
}

function SongRow({ song, release }: { song: Song; release: () => void }) {
  return <div className="song-row"><div className="song-art"><Music2 size={17} /></div><div className="song-main"><b>{song.title}</b><span>{song.genre} · {song.bpm} BPM · {song.status.toLowerCase()} · {song.streams ? `${(song.streams / 1000).toFixed(0)}K streams` : `${song.quality} quality`}</span></div><span className="quality-badge">{song.quality}</span>{song.status !== 'RELEASED' && <button className="pill-button small" onClick={release}>RELEASE</button>}</div>;
}

export default function GameClient() {
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [toast, setToast] = useState('');
  const game = useGame();
  useEffect(() => { void useGame.persist.rehydrate(); }, []);
  useEffect(() => { if (game.lastEvent) { setToast(game.lastEvent); const timer = window.setTimeout(() => { setToast(''); game.dismissEvent(); }, 3600); return () => window.clearTimeout(timer); } }, [game.lastEvent, game.dismissEvent]);

  const interact = (name: string) => {
    if (name === 'phone') return setPhoneOpen(true);
    if (name === 'bed') return game.sleep();
    if (name === 'kitchen') return game.eat();
    if (name === 'studio') return setPanel('studio');
    if (name === 'door' || name === 'car') return setPanel('world');
    if (name === 'laptop') return setPanel('career');
    if (name === 'wardrobe') return setPanel('shop');
    if (name === 'computer') return setPanel('career');
  };
  const openNav = (key: 'home' | 'world' | 'music' | 'career' | 'phone') => {
    if (key === 'home') { setPanel(null); setPhoneOpen(false); return; }
    if (key === 'phone') { setPhoneOpen(true); return; }
    setPanel(key === 'world' ? 'world' : key === 'music' ? 'music' : 'career');
  };
  const fanLabel = game.fans >= 1000000 ? `${(game.fans / 1000000).toFixed(1)}M` : `${Math.round(game.fans / 1000)}K`;
  return <main className="game-shell">
    <div className="world-plate" style={{ backgroundImage: "url('/art/artist-apartment.png')" }} />
    <div className="world-vignette" />
    <div className="game-ui">
      <header className="game-header">
        <div className="brand-lockup"><div className="brand-mark">T.</div><div><div className="brand-word">TREBLR</div><div className="eyebrow" style={{ color: 'rgba(255,255,255,.56)', marginTop: 3, fontSize: 7 }}>LIFE IN THE MUSIC</div></div></div>
        <div className="world-chip"><MapPin size={13} color="#ffc48a" /><span>{game.currentCity}</span><i className="chip-separator"/><span>{game.time}</span><i className="chip-separator"/><span>{game.weather.split('·')[0].trim()}</span></div>
        <div className="header-right"><button className="icon-button" aria-label="Notifications" onClick={() => setPanel('notifications')}><Bell size={17}/></button><button className="avatar-menu" onClick={() => setPanel('profile')}><span className="avatar-bubble">C</span><span>{game.artist.name}</span></button></div>
      </header>
      <WorldRoom city={game.currentCity} onInteract={interact} />
      <div className="scene-title"><div className="scene-kicker eyebrow"><i/> HOME · 06:42 PM <Sun size={12}/></div><h1>Make a life<br/>that sounds<br/><em style={{ color: '#ffc28d', fontStyle: 'normal' }}>like you.</em></h1><p>The rain’s easing up. Teo texted about a session. The city is still awake.</p></div>
      <div className="scene-prompt"><span className="pulse-dot"/> Something’s happening tonight <ChevronRight size={13}/></div>
      <div className="bottom-stage"><div className="quick-status">
        <div className="status-pill"><Heart className="status-icon" size={15}/><div><div className="status-label">ENERGY</div><div className="status-value">{game.energy}%</div><div className="status-meter"><i style={{ width: `${game.energy}%` }}/></div></div></div>
        <div className="status-pill"><Sparkles className="status-icon" size={15}/><div><div className="status-label">MOOD</div><div className="status-value">{game.mood > 78 ? 'In a good place' : game.mood > 48 ? 'Finding the groove' : 'Need a breather'}</div></div></div>
        <div className="status-pill"><Flame className="status-icon" size={15}/><div><div className="status-label">HYPE</div><div className="status-value">{game.hype}%</div><div className="status-meter"><i style={{ width: `${game.hype}%` }}/></div></div></div>
        <div className="status-pill money-pill"><Wallet className="status-icon" size={15}/><div><div className="status-label">CASH · BANK</div><div className="status-value">${game.money.toLocaleString()} <span style={{ color: 'rgba(255,255,255,.55)' }}>· ${(game.bank / 1000).toFixed(0)}K</span></div></div></div>
        <div className="status-pill"><Users className="status-icon" size={15}/><div><div className="status-label">YOUR PEOPLE</div><div className="status-value">{fanLabel} fans</div></div></div>
      </div><p className="stage-nudge">Your world is already moving.<br/>Tap something and see where it goes.</p></div>
    </div>
    <nav className="bottom-nav" aria-label="Game navigation">
      <button className="nav-item active" onClick={() => openNav('home')}><BedDouble/><span>HOME</span></button>
      <button className="nav-item" onClick={() => openNav('world')}><Compass/><span>WORLD</span></button>
      <button className="nav-item" onClick={() => openNav('music')}><Music2/><span>MUSIC</span></button>
      <button className="nav-item" onClick={() => openNav('career')}><CalendarDays/><span>CAREER</span></button>
      <button className="nav-item phone-nav" onClick={() => openNav('phone')}><div style={{ fontSize: 16, lineHeight: 1 }}>⌁</div><span>PHONE</span></button>
    </nav>
    <Phone open={phoneOpen} setOpen={setPhoneOpen} onPanel={(p) => { setPhoneOpen(false); setPanel(p as PanelKey); }} />
    <AnimatePresence>{panel && <Panel kind={panel} close={() => setPanel(null)}/>}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>{toast}</motion.div>}</AnimatePresence>
  </main>;
}
