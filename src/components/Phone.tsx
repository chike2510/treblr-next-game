'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Bell, CalendarDays, Camera, CarFront, ChevronRight, CircleDollarSign, Headphones, MapPin, Music2, Settings, ShoppingBag, Users, X, Youtube, Instagram, MessageCircle, Video, Globe2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/lib/game';
import PhoneDestinationScreen, { type PhoneScreen } from '@/components/PhoneScreens';
import PhoneShader from '@/components/PhoneShader';

const apps = [
  { name: 'Studio', icon: Headphones, color: 'linear-gradient(145deg,#f4a254,#df4e45)', panel: 'studio' },
  { name: 'Messages', icon: MessageCircle, color: 'linear-gradient(145deg,#55c971,#269452)', screen: 'messages' },
  { name: 'Social', icon: Camera, color: 'linear-gradient(145deg,#c14b91,#f39d52)', screen: 'social' },
  { name: 'Bank', icon: CircleDollarSign, color: 'linear-gradient(145deg,#50b884,#207654)', screen: 'bank' },
  { name: 'Boutique', icon: ShoppingBag, color: 'linear-gradient(145deg,#f2c367,#ba664e)', screen: 'boutique' },
  { name: 'Rides', icon: CarFront, color: 'linear-gradient(145deg,#647788,#26364a)', screen: 'rides' },
  { name: 'Map', icon: MapPin, color: 'linear-gradient(145deg,#65b8d4,#3e6ea7)', screen: 'map' },
  { name: 'Calendar', icon: CalendarDays, color: 'linear-gradient(145deg,#e6795c,#b1444e)', screen: 'calendar' },
  { name: 'Settings', icon: Settings, color: 'linear-gradient(145deg,#77818f,#353945)', panel: 'settings' },
  { name: 'Music', icon: Music2, color: 'linear-gradient(145deg,#4fcd99,#29a380)', panel: 'music' },
  { name: 'World', icon: Globe2, color: 'linear-gradient(145deg,#72b7a8,#2b5868)', screen: 'map' },
  { name: 'Label', icon: Youtube, color: 'linear-gradient(145deg,#f26955,#b82e3d)', screen: 'label' },
  { name: 'Team', icon: Users, color: 'linear-gradient(145deg,#8582d3,#4f5ba1)', screen: 'team' },
  { name: 'Shows', icon: Video, color: 'linear-gradient(145deg,#e4a052,#b95d43)', screen: 'shows' },
  { name: 'Travel', icon: MapPin, color: 'linear-gradient(145deg,#5db3bc,#4476b8)', screen: 'rides' },
  { name: 'Photos', icon: Instagram, color: 'linear-gradient(145deg,#d85b72,#6a356f)', screen: 'social' },
];

export default function Phone({ open, setOpen, onPanel }: { open: boolean; setOpen: (v: boolean) => void; onPanel: (v: string) => void }) {
  const [screen, setScreen] = useState<PhoneScreen | 'messages' | 'social' | 'bank'>('lock');
  const [transferAmount, setTransferAmount] = useState('500');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const game = useGame();
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); } };
    window.addEventListener('keydown', handleKey);
    return () => { window.removeEventListener('keydown', handleKey); document.body.style.overflow = priorOverflow; previousFocus?.focus(); };
  }, [open]);
  const launch = (app: (typeof apps)[number]) => {
    if (app.screen) setScreen(app.screen as PhoneScreen | 'messages' | 'social' | 'bank');
    else if (app.panel) onPanel(app.panel);
  };
  const platformCards = [
    { name: 'Instagram', path: 'instagram', description: 'Moments in this save', icon: 'ig', background: 'linear-gradient(145deg,#b043b4,#f39b54)' },
    { name: 'TikTok', path: 'tiktok', description: 'Song snippets · local only', icon: 'tk', background: 'linear-gradient(145deg,#121214,#3c3b43)' },
    { name: 'X', path: 'x', description: 'Short notes · local only', icon: 'X', background: 'linear-gradient(145deg,#55545a,#121214)' },
    { name: 'YouTube', path: 'youtube', description: 'Video ideas · local only', icon: '▶', background: 'linear-gradient(145deg,#fa534e,#c82031)' },
    { name: 'Spotify', path: 'spotify', description: 'Released songs in this save', icon: '≋', background: 'linear-gradient(145deg,#63d297,#238658)' },
    { name: 'Apple Music', path: 'apple-music', description: 'Catalog · modeled only', icon: '♫', background: 'linear-gradient(145deg,#ef718a,#9d305c)' },
    { name: 'SoundCloud', path: 'soundcloud', description: 'Track notes · local only', icon: '☁', background: 'linear-gradient(145deg,#ff9b3d,#df512b)' },
    { name: 'Audiomack', path: 'audiomack', description: 'Mixtapes · local only', icon: 'a', background: 'linear-gradient(145deg,#ffc247,#dd8428)' },
    { name: 'Threads', path: 'threads', description: 'A slower conversation', icon: '@', background: 'linear-gradient(145deg,#45434a,#18181b)' },
    { name: 'Facebook', path: 'facebook', description: 'People and event notes', icon: 'f', background: 'linear-gradient(145deg,#5a8bea,#3656a7)' },
    { name: 'Twitch', path: 'twitch', description: 'Live writing · local only', icon: '▣', background: 'linear-gradient(145deg,#a776ef,#5d43a6)' },
    { name: 'Snapchat', path: 'snapchat', description: 'Quick story · local only', icon: '◉', background: 'linear-gradient(145deg,#ffe658,#e6b92c)' },
  ];
  const reduceMotion = useReducedMotion();
  return <AnimatePresence>{open && <motion.div className="phone-layer" initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: reduceMotion ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : .2 }}>
    <motion.button type="button" className="phone-scrim" aria-label="Close phone and return to game" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .18 }}/>
    <motion.div id="in-game-phone" role="dialog" aria-modal="true" aria-label="In-game phone" className="phone-frame" initial={reduceMotion ? false : { y: 110, opacity: 0, scale: .92 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { y: 120, opacity: 0, scale: .92 }} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}>
      <button ref={closeButtonRef} className="phone-dismiss" onClick={() => setOpen(false)} aria-label="Close phone"><X size={16}/></button>
      <div className="phone-top"><span>9:41</span><div className="dynamic-island"/><span>◔ ◈ ▰</span></div>
      <div className="phone-display">
        <PhoneShader active={open}/>
        {screen === 'lock' && <button className="phone-lock" onClick={() => setScreen('home')}><div className="phone-clock">{game.time.replace(/ (AM|PM)/, '')}</div><div className="phone-date">DAY {game.day} · {game.currentCity.toUpperCase()}</div><div className="phone-widget"><div className="eyebrow">YOUR CITY · {game.currentCity.toUpperCase()}</div><strong>{game.notifications[0] || 'A new day is yours.'}</strong><span>{game.weather} · Keep the evening open.</span></div><div style={{ display: 'flex', gap: 10, width: '100%' }}><div className="phone-widget" style={{ margin: 0 }}><div className="eyebrow">NEXT UP</div><strong style={{ fontSize: 14 }}>{game.opportunities[0]?.title ?? 'A quiet day ahead'}</strong><span>{game.opportunities[0] ? `Through day ${game.opportunities[0].expiresOnDay} · ${game.opportunities[0].city ?? 'any city'}` : 'Make room for something new.'}</span></div></div><span className="phone-unlock">Tap anywhere to unlock</span></button>}
        {screen === 'home' && <><div className="phone-home-head"><div><div className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>{game.currentCity.toUpperCase()} · DAY {game.day}</div><h3>{game.time.includes('AM') ? 'Morning' : game.time.startsWith('12') || game.time.startsWith('1') || game.time.startsWith('2') || game.time.startsWith('3') || game.time.startsWith('4') || game.time.startsWith('5') ? 'Afternoon' : 'Evening'}, {game.artist.name}.</h3></div><button className="phone-back" onClick={() => setScreen('lock')}><Bell size={15}/></button></div><div className="app-grid">{apps.map((app) => <button className="phone-app" key={app.name} onClick={() => launch(app)}><span className="app-icon" style={{ background: app.color }}><app.icon size={22}/></span><span>{app.name}</span></button>)}</div><div className="phone-dock">{apps.slice(1, 5).map((app) => <button className="phone-app wide" key={app.name} onClick={() => launch(app)}><span className="app-icon" style={{ background: app.color }}><app.icon size={20}/></span></button>)}</div></>}
        {screen === 'messages' && <><ScreenHead title="Messages" back={() => setScreen('home')}/><div className="message-thread">{game.relationships.map((p) => <div className="message-card" key={p.name}><div className="message-person"><span className="avatar-bubble">{p.avatar}</span><div><b style={{ font: '600 11px var(--display)' }}>{p.name}</b><div style={{ fontSize: 8, color: 'rgba(255,255,255,.55)' }}>{p.role}</div></div></div><div>{p.note}</div><div className="phone-message-actions"><button className="phone-response" onClick={() => game.messagePerson(p.name, 'reply')}>Reply · keep talking</button><button className="phone-response" disabled={p.name === 'Teo Park' && game.currentCity !== 'Lagos' || game.money < 210 || game.energy < 12} onClick={() => game.messagePerson(p.name, 'accept-session')}>Book a session · $210</button><button className="phone-response subtle" onClick={() => game.messagePerson(p.name, 'decline')}>Pass politely</button></div></div>)}</div></>}
        {screen === 'social' && <><ScreenHead title="Social world" back={() => setScreen('home')}/><p style={{ fontSize: 10, color: 'rgba(255,255,255,.62)', margin: '-5px 0 15px' }}>Platform-inspired rooms, all kept in this save. Nothing posts outside the game.</p>{platformCards.map((p) => <Link className="phone-social-card" href={`/social/${p.path}`} key={p.path} onClick={() => setOpen(false)}><span className="phone-social-logo" style={{ background: p.background }}>{p.icon}</span><span style={{ flex: 1 }}><strong>{p.name}</strong><small>{p.description}</small></span><ChevronRight size={15}/></Link>)}<Link href="/social" className="phone-create" onClick={() => setOpen(false)} style={{ display: 'block', textAlign: 'center' }}>OPEN SOCIAL HUB</Link></>}
        {screen === 'bank' && <><ScreenHead title="Your money" back={() => setScreen('home')}/><div className="phone-widget" style={{ marginTop: 6 }}><div className="eyebrow">AVAILABLE CASH</div><strong style={{ fontSize: 32 }}>${game.money.toLocaleString()}</strong><span>Separate savings · ${game.bank.toLocaleString()}</span></div><div className="phone-bank-actions"><label className="form-label" htmlFor="transfer-amount">Transfer amount</label><input id="transfer-amount" className="field" type="number" min="1" step="50" value={transferAmount} onChange={(event) => setTransferAmount(event.target.value)}/><div><button className="phone-create" onClick={() => game.transferMoney(Number(transferAmount), 'deposit')}>MOVE TO SAVINGS</button><button className="phone-response" onClick={() => game.transferMoney(Number(transferAmount), 'withdraw')}>WITHDRAW TO CASH</button></div></div><div className="message-card"><div className="eyebrow">RECENT LEDGER · CASH</div>{game.ledger.filter((entry) => entry.bucket === 'cash').slice(0, 4).map((entry) => <p className="phone-ledger-entry" key={entry.id}><span>{entry.description}<small>Day {entry.day}</small></span><b className={entry.amount >= 0 ? 'positive' : 'negative'}>{entry.amount >= 0 ? '+' : '−'}${Math.abs(entry.amount).toLocaleString()}</b></p>)}</div><button className="phone-create" onClick={() => onPanel('career')}>FIND AN OPPORTUNITY</button></>}
        {screen !== 'lock' && screen !== 'home' && screen !== 'messages' && screen !== 'social' && screen !== 'bank' && <PhoneDestinationScreen screen={screen} back={() => setScreen('home')} setScreen={setScreen} onPanel={onPanel}/>}
      </div>
      <div className="phone-home-indicator"><i/></div>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}

function ScreenHead({ title, back }: { title: string; back: () => void }) {
  return <div className="phone-screen-head"><button className="phone-back" onClick={back}><ArrowLeft size={15}/></button><h3>{title}</h3></div>;
}
