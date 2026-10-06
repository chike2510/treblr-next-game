'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Bell, CalendarDays, Camera, CarFront, ChevronRight, CircleDollarSign, Headphones, MapPin, Music2, Settings, ShoppingBag, Users, X, Youtube, Instagram, MessageCircle, Video, Globe2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useGame } from '@/lib/game';

const apps = [
  { name: 'Studio', icon: Headphones, color: 'linear-gradient(145deg,#f4a254,#df4e45)', panel: 'studio' },
  { name: 'Messages', icon: MessageCircle, color: 'linear-gradient(145deg,#55c971,#269452)', screen: 'messages' },
  { name: 'Social', icon: Camera, color: 'linear-gradient(145deg,#c14b91,#f39d52)', screen: 'social' },
  { name: 'Bank', icon: CircleDollarSign, color: 'linear-gradient(145deg,#50b884,#207654)', screen: 'bank' },
  { name: 'Boutique', icon: ShoppingBag, color: 'linear-gradient(145deg,#f2c367,#ba664e)', panel: 'shop' },
  { name: 'Rides', icon: CarFront, color: 'linear-gradient(145deg,#647788,#26364a)', panel: 'world' },
  { name: 'Map', icon: MapPin, color: 'linear-gradient(145deg,#65b8d4,#3e6ea7)', panel: 'world' },
  { name: 'Calendar', icon: CalendarDays, color: 'linear-gradient(145deg,#e6795c,#b1444e)', panel: 'career' },
  { name: 'Settings', icon: Settings, color: 'linear-gradient(145deg,#77818f,#353945)', panel: 'settings' },
  { name: 'Music', icon: Music2, color: 'linear-gradient(145deg,#4fcd99,#29a380)', panel: 'music' },
  { name: 'World', icon: Globe2, color: 'linear-gradient(145deg,#72b7a8,#2b5868)', panel: 'world' },
  { name: 'Label', icon: Youtube, color: 'linear-gradient(145deg,#f26955,#b82e3d)', panel: 'career' },
  { name: 'Team', icon: Users, color: 'linear-gradient(145deg,#8582d3,#4f5ba1)', panel: 'team' },
  { name: 'Shows', icon: Video, color: 'linear-gradient(145deg,#e4a052,#b95d43)', panel: 'career' },
  { name: 'Travel', icon: MapPin, color: 'linear-gradient(145deg,#5db3bc,#4476b8)', panel: 'world' },
  { name: 'Photos', icon: Instagram, color: 'linear-gradient(145deg,#d85b72,#6a356f)', screen: 'social' },
];

export default function Phone({ open, setOpen, onPanel }: { open: boolean; setOpen: (v: boolean) => void; onPanel: (v: string) => void }) {
  const [screen, setScreen] = useState<string>('lock');
  const game = useGame();
  const launch = (app: (typeof apps)[number]) => {
    if (app.screen) setScreen(app.screen);
    else if (app.panel) onPanel(app.panel);
  };
  const platformCards = [
    { name: 'Instagram', path: 'instagram', metric: '124K followers', icon: 'ig', background: 'linear-gradient(145deg,#b043b4,#f39b54)' },
    { name: 'TikTok', path: 'tiktok', metric: '320K followers', icon: 'tk', background: 'linear-gradient(145deg,#121214,#3c3b43)' },
    { name: 'X', path: 'x', metric: '89K followers', icon: 'X', background: 'linear-gradient(145deg,#55545a,#121214)' },
    { name: 'YouTube', path: 'youtube', metric: '65K subscribers', icon: '▶', background: 'linear-gradient(145deg,#fa534e,#c82031)' },
    { name: 'Spotify', path: 'spotify', metric: '482K monthly listeners', icon: '≋', background: 'linear-gradient(145deg,#63d297,#238658)' },
    { name: 'Apple Music', path: 'apple-music', metric: '308K monthly listeners', icon: '♫', background: 'linear-gradient(145deg,#ef718a,#9d305c)' },
    { name: 'SoundCloud', path: 'soundcloud', metric: '183K monthly plays', icon: '☁', background: 'linear-gradient(145deg,#ff9b3d,#df512b)' },
    { name: 'Audiomack', path: 'audiomack', metric: 'Trending this week', icon: 'a', background: 'linear-gradient(145deg,#ffc247,#dd8428)' },
    { name: 'Threads', path: 'threads', metric: '49K followers', icon: '@', background: 'linear-gradient(145deg,#45434a,#18181b)' },
    { name: 'Facebook', path: 'facebook', metric: '78K page followers', icon: 'f', background: 'linear-gradient(145deg,#5a8bea,#3656a7)' },
    { name: 'Twitch', path: 'twitch', metric: 'Live after the next session', icon: '▣', background: 'linear-gradient(145deg,#a776ef,#5d43a6)' },
    { name: 'Snapchat', path: 'snapchat', metric: '97K story opens', icon: '◉', background: 'linear-gradient(145deg,#ffe658,#e6b92c)' },
  ];
  return <AnimatePresence>{open && <motion.div className="phone-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.div className="phone-frame" initial={{ y: 45, opacity: 0, scale: .97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 45, opacity: 0, scale: .97 }} transition={{ duration: .25 }}>
      <button className="phone-dismiss" onClick={() => setOpen(false)} aria-label="Close phone"><X size={16}/></button>
      <div className="phone-top"><span>9:41</span><div className="dynamic-island"/><span>◔ ◈ ▰</span></div>
      <div className="phone-display">
        {screen === 'lock' && <button className="phone-lock" onClick={() => setScreen('home')}><div className="phone-clock">{game.time.replace(/ (AM|PM)/, '')}</div><div className="phone-date">TUESDAY, OCTOBER {game.day}</div><div className="phone-widget"><div className="eyebrow">YOUR CITY · {game.currentCity.toUpperCase()}</div><strong>{game.notifications[0] || 'A new day is yours.'}</strong><span>{game.weather} · Keep the evening open.</span></div><div style={{ display: 'flex', gap: 10, width: '100%' }}><div className="phone-widget" style={{ margin: 0 }}><div className="eyebrow">NEXT UP</div><strong style={{ fontSize: 14 }}>Lagos Music Festival</strong><span>Golden-hour main stage · 6 days</span></div></div><span className="phone-unlock">Tap anywhere to unlock</span></button>}
        {screen === 'home' && <><div className="phone-home-head"><div><div className="eyebrow" style={{ color: 'rgba(255,255,255,.6)' }}>{game.currentCity.toUpperCase()} · TUESDAY</div><h3>Evening, Candelar.</h3></div><button className="phone-back" onClick={() => setScreen('lock')}><Bell size={15}/></button></div><div className="app-grid">{apps.map((app) => <button className="phone-app" key={app.name} onClick={() => launch(app)}><span className="app-icon" style={{ background: app.color }}><app.icon size={22}/></span><span>{app.name}</span></button>)}</div><div className="phone-dock">{apps.slice(1, 5).map((app) => <button className="phone-app wide" key={app.name} onClick={() => launch(app)}><span className="app-icon" style={{ background: app.color }}><app.icon size={20}/></span></button>)}</div></>}
        {screen === 'messages' && <><ScreenHead title="Messages" back={() => setScreen('home')}/><div className="message-thread">{game.relationships.map((p) => <div className="message-card" key={p.name}><div className="message-person"><span className="avatar-bubble">{p.avatar}</span><div><b style={{ font: '600 11px var(--display)' }}>{p.name}</b><div style={{ fontSize: 8, color: 'rgba(255,255,255,.55)' }}>{p.role}</div></div></div><div>{p.note}</div><button className="phone-response" onClick={() => game.messagePerson(p.name)}>Reply · “I’m in. Let’s make something.”</button></div>)}</div></>}
        {screen === 'social' && <><ScreenHead title="Social world" back={() => setScreen('home')}/><p style={{ fontSize: 10, color: 'rgba(255,255,255,.62)', margin: '-5px 0 15px' }}>Every platform has its own voice. Step inside.</p>{platformCards.map((p) => <Link className="phone-social-card" href={`/social/${p.path}`} key={p.path} onClick={() => setOpen(false)}><span className="phone-social-logo" style={{ background: p.background }}>{p.icon}</span><span style={{ flex: 1 }}><strong>{p.name}</strong><small>{p.metric}</small></span><ChevronRight size={15}/></Link>)}<Link href="/social" className="phone-create" onClick={() => setOpen(false)} style={{ display: 'block', textAlign: 'center' }}>OPEN SOCIAL HUB</Link></>}
        {screen === 'bank' && <><ScreenHead title="Your money" back={() => setScreen('home')}/><div className="phone-widget" style={{ marginTop: 6 }}><div className="eyebrow">AVAILABLE CASH</div><strong style={{ fontSize: 32 }}>${game.money.toLocaleString()}</strong><span>Plus ${game.bank.toLocaleString()} tucked away.</span></div><div className="message-card"><div className="eyebrow">THIS WEEK</div><p style={{ fontSize: 12, lineHeight: 1.6 }}>Studio time · −$125<br/>Late dinner · −$18<br/>Streaming royalties · +$680</p></div><button className="phone-create" onClick={() => onPanel('career')}>FIND AN OPPORTUNITY</button></>}
      </div>
      <div className="phone-home-indicator"><i/></div>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}

function ScreenHead({ title, back }: { title: string; back: () => void }) {
  return <div className="phone-screen-head"><button className="phone-back" onClick={back}><ArrowLeft size={15}/></button><h3>{title}</h3></div>;
}
