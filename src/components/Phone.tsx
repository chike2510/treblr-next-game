'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Bell, CalendarDays, Camera, CarFront, ChevronRight, CircleDollarSign, Headphones, MapPin, Settings, Users, X, MessageCircle, Star } from 'lucide-react';
import { cityByName } from '@/lib/cities';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/lib/game';
import PhoneDestinationScreen, { type PhoneScreen } from '@/components/PhoneScreens';
import PhoneShader from '@/components/PhoneShader';

type AppTone = 'people' | 'money' | 'make' | 'move' | 'system';
/** TREBLR OS: focused apps, no duplicates, five category tones instead of a rainbow. */
const apps: { name: string; icon: typeof Headphones; tone: AppTone; screen?: string; panel?: string }[] = [
  { name: 'Messages', icon: MessageCircle, tone: 'people', screen: 'messages' },
  { name: 'Social', icon: Camera, tone: 'people', screen: 'social' },
  { name: 'Team', icon: Users, tone: 'people', screen: 'team' },
  { name: 'Studio', icon: Headphones, tone: 'make', panel: 'studio' },
  { name: 'Bank', icon: CircleDollarSign, tone: 'money', screen: 'bank' },
  { name: 'Tonight', icon: Star, tone: 'people', screen: 'shows' },
  { name: 'Calendar', icon: CalendarDays, tone: 'money', screen: 'calendar' },
  { name: 'Map', icon: MapPin, tone: 'move', screen: 'map' },
  { name: 'Rides', icon: CarFront, tone: 'move', screen: 'rides' },
  { name: 'Settings', icon: Settings, tone: 'system', panel: 'settings' },
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
    { name: 'Instagram', path: 'instagram', description: 'Photos and stories', icon: 'Ig' },
    { name: 'TikTok', path: 'tiktok', description: 'Song snippets', icon: 'Tk' },
    { name: 'X', path: 'x', description: 'Short notes', icon: 'X' },
    { name: 'YouTube', path: 'youtube', description: 'Videos and sessions', icon: 'Yt' },
    { name: 'Spotify', path: 'spotify', description: 'Your released songs', icon: 'Sp' },
    { name: 'Apple Music', path: 'apple-music', description: 'Your catalogue', icon: 'Am' },
    { name: 'SoundCloud', path: 'soundcloud', description: 'Demos and drafts', icon: 'Sc' },
    { name: 'Audiomack', path: 'audiomack', description: 'Mixtapes', icon: 'Ak' },
    { name: 'Threads', path: 'threads', description: 'Slower conversations', icon: 'Th' },
    { name: 'Facebook', path: 'facebook', description: 'People and events', icon: 'Fb' },
    { name: 'Twitch', path: 'twitch', description: 'Live writing', icon: 'Tw' },
    { name: 'Snapchat', path: 'snapchat', description: 'Quick stories', icon: 'Sn' },
  ];
  const reduceMotion = useReducedMotion();
  return <AnimatePresence>{open && <motion.div className="phone-layer" initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: reduceMotion ? 1 : 0 }} transition={{ duration: reduceMotion ? 0 : .2 }}>
    <motion.button type="button" className="phone-scrim" aria-label="Close phone and return to game" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .18 }}/>
    <motion.div id="in-game-phone" role="dialog" aria-modal="true" aria-label="In-game phone" className="phone-frame" initial={reduceMotion ? false : { y: 110, opacity: 0, scale: .92 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { y: 120, opacity: 0, scale: .92 }} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 30 }}>
      <button ref={closeButtonRef} className="phone-dismiss" onClick={() => setOpen(false)} aria-label="Close phone"><X size={16}/></button>
      <div className="phone-top"><span className="mono">{game.time}</span><span className="phone-top-city">{game.currentCity}</span></div>
      <div className="phone-display" style={{ backgroundImage: `linear-gradient(180deg, rgba(14,13,12,.55), rgba(14,13,12,.88)), url(${cityByName(game.currentCity).image})` }}>
        <PhoneShader active={open}/>
        {screen === 'lock' && <button className="phone-lock" onClick={() => setScreen('home')}><div className="phone-clock">{game.time.replace(/ (AM|PM)/, '')}</div><div className="phone-date">DAY {game.day} · {game.currentCity.toUpperCase()}</div><div className="phone-widget"><div className="eyebrow">YOUR CITY · {game.currentCity.toUpperCase()}</div><strong>{game.notifications[0] || 'A new day is yours.'}</strong><span>{game.weather} · Keep the evening open.</span></div><div style={{ display: 'flex', gap: 10, width: '100%' }}><div className="phone-widget" style={{ margin: 0 }}><div className="eyebrow">NEXT UP</div><strong style={{ fontSize: 14 }}>{game.opportunities[0]?.title ?? 'A quiet day ahead'}</strong><span>{game.opportunities[0] ? `Through day ${game.opportunities[0].expiresOnDay} · ${game.opportunities[0].city ?? 'any city'}` : 'Make room for something new.'}</span></div></div><span className="phone-unlock">Tap anywhere to unlock</span></button>}
        {screen === 'home' && <><div className="phone-home-head"><div><div className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>{game.currentCity.toUpperCase()} · DAY {game.day}</div><h3>{game.time.includes('AM') ? 'Morning' : game.time.startsWith('12') || game.time.startsWith('1') || game.time.startsWith('2') || game.time.startsWith('3') || game.time.startsWith('4') || game.time.startsWith('5') ? 'Afternoon' : 'Evening'}, {game.artist.name}.</h3></div><button className="phone-back" onClick={() => setScreen('lock')}><Bell size={15}/></button></div><div className="app-grid">{apps.map((app) => <button className="phone-app" key={app.name} onClick={() => launch(app)}><span className={`app-icon app-tone-${app.tone}`}><app.icon size={22}/></span><span>{app.name}</span></button>)}</div></>}
        {screen === 'messages' && <><ScreenHead title="Messages" back={() => setScreen('home')}/><div className="message-thread">{game.relationships.map((p) => <div className="message-card" key={p.name}><div className="message-person"><span className="avatar-bubble">{p.avatar}</span><div><b style={{ font: '600 11px var(--display)' }}>{p.name}</b><div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>{p.role}</div></div></div><div>{p.note}</div><div className="phone-message-actions"><button className="phone-response" onClick={() => game.messagePerson(p.name, 'reply')}>Reply · keep talking</button><button className="phone-response" disabled={p.name === 'Teo Park' && game.currentCity !== 'Lagos' || game.money < 210 || game.energy < 12} onClick={() => game.messagePerson(p.name, 'accept-session')}>Book a session · $210</button><button className="phone-response subtle" onClick={() => game.messagePerson(p.name, 'decline')}>Pass politely</button></div></div>)}</div></>}
        {screen === 'social' && <><ScreenHead title="Social world" back={() => setScreen('home')}/>{platformCards.map((p) => <Link className="phone-social-card" href={`/social/${p.path}`} key={p.path} onClick={() => setOpen(false)}><span className="phone-social-logo">{p.icon}</span><span style={{ flex: 1 }}><strong>{p.name}</strong><small>{p.description}</small></span><ChevronRight size={15}/></Link>)}<Link href="/social" className="phone-create" onClick={() => setOpen(false)} style={{ display: 'block', textAlign: 'center' }}>Open social hub</Link></>}
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
