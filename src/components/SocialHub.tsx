'use client';

import { ArrowUpRight, BadgeCheck, ChevronLeft, Heart, MessageCircle, Play, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useGame } from '@/lib/game';

const platforms = [
  { name: 'Instagram', path: 'instagram', label: '@candelar', icon: 'ig', color: 'linear-gradient(145deg,#ab3eb0,#f19550)', engagement: '8.4%', kind: '124K followers' },
  { name: 'TikTok', path: 'tiktok', label: '@candelar', icon: '♪', color: 'linear-gradient(145deg,#161619,#4d4b53)', engagement: '12.1%', kind: '320K followers' },
  { name: 'X', path: 'x', label: '@candelar', icon: 'X', color: '#17171a', engagement: '4.2%', kind: '89K followers' },
  { name: 'YouTube', path: 'youtube', label: 'Candelar', icon: '▶', color: 'linear-gradient(145deg,#ef564d,#b82739)', engagement: '6.8%', kind: '65K subscribers' },
  { name: 'Spotify', path: 'spotify', label: 'Candelar', icon: '≋', color: 'linear-gradient(145deg,#54d394,#218150)', engagement: 'WORLDWIDE', kind: 'monthly listeners' },
  { name: 'Apple Music', path: 'apple-music', label: 'Candelar', icon: '♫', color: 'linear-gradient(145deg,#ef718a,#9d305c)', engagement: 'TOP CITY', kind: 'monthly listeners' },
  { name: 'SoundCloud', path: 'soundcloud', label: 'candelar', icon: '☁', color: 'linear-gradient(145deg,#ff9b3d,#df512b)', engagement: 'MOST PLAYED', kind: 'plays this month' },
  { name: 'Audiomack', path: 'audiomack', label: 'Candelar', icon: 'a', color: 'linear-gradient(145deg,#ffc247,#dd8428)', engagement: 'TRENDING', kind: 'monthly listeners' },
  { name: 'Threads', path: 'threads', label: '@candelar', icon: '@', color: '#28262b', engagement: '4.9%', kind: 'followers' },
  { name: 'Facebook', path: 'facebook', label: 'Candelar Music', icon: 'f', color: 'linear-gradient(145deg,#5a8bea,#3656a7)', engagement: '6.2%', kind: 'page followers' },
  { name: 'Twitch', path: 'twitch', label: 'candelarlive', icon: '▣', color: 'linear-gradient(145deg,#a776ef,#5d43a6)', engagement: 'LIVE SOON', kind: 'community' },
  { name: 'Snapchat', path: 'snapchat', label: 'candelar', icon: '◉', color: 'linear-gradient(145deg,#ffe658,#e6b92c)', engagement: 'STORY VIEWS', kind: 'daily opens' },
];
const fmt = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : `${Math.round(n / 1000)}K`;

export default function SocialHub() {
  const game = useGame();
  useEffect(() => { void useGame.persist.rehydrate(); }, []);
  const metrics: Record<string, number> = {
    Instagram: 124000 + Math.round((game.fans - 482000) * .22), TikTok: 320000 + Math.round((game.fans - 482000) * .48),
    X: 89000 + Math.round((game.fans - 482000) * .12), YouTube: 65000 + Math.round((game.fans - 482000) * .1),
    Spotify: game.monthlyListeners, 'Apple Music': Math.round(game.monthlyListeners * .64), SoundCloud: Math.round(game.monthlyListeners * .38),
    Audiomack: Math.round(game.monthlyListeners * .31), Threads: 49000 + Math.round((game.fans - 482000) * .08),
    Facebook: 78000 + Math.round((game.fans - 482000) * .06), Twitch: 12000 + Math.round((game.fans - 482000) * .025), Snapchat: 97000 + Math.round((game.fans - 482000) * .11),
  };
  return <main className="social-hub-page">
    <header className="site-header"><Link href="/" className="site-logo">TREBLR</Link><Link href="/" className="back-link"><ChevronLeft size={13} style={{ verticalAlign: 'middle' }}/> Back to the apartment</Link></header>
    <section className="social-main">
      <div className="social-title"><div><div className="eyebrow" style={{ color: '#aa7356' }}>THE PHONE · SOCIAL</div><h1>Your world, online.</h1><p>Different corners of your life have different voices. Share a moment, find a listener, see where the story goes.</p></div><div className="social-mini-stats"><div className="mini-stat"><span>FANS ACROSS YOUR WORLDS</span><b>{fmt(game.fans)}</b></div><div className="mini-stat"><span>YOUR LATEST RIPPLE</span><b>{game.posts[0]?.platform || 'Social'}</b></div></div></div>
      <div className="social-grid">{platforms.map((p) => <Link href={`/social/${p.path}`} className="social-card" key={p.path}>
        <span className="platform-mark" style={{ background: p.color, color: p.name === 'Snapchat' ? '#28231c' : 'white' }}>{p.icon}</span>
        <span className="social-copy"><strong>{p.name} <BadgeCheck size={13} color="#437d76" fill="#dcece6" style={{ verticalAlign: 'middle' }}/></strong><p>{p.label} · {game.posts.filter((post) => post.platform === p.name).length + 4} recent moments</p></span>
        <span className="social-stats"><b>{fmt(metrics[p.name] ?? game.fans)}</b><small>{p.engagement === 'WORLDWIDE' ? 'monthly listeners' : p.engagement === 'TOP CITY' ? 'listeners in Lagos' : p.engagement === 'MOST PLAYED' ? 'plays this month' : p.kind}</small></span><ArrowUpRight size={15} color="#9b8b83"/>
      </Link>)}</div>
      <div className="social-bottom-note"><div><div className="eyebrow">A LITTLE LIFE, SHARED</div><p><Heart size={14}/> Posts can bring in new fans, lift your hype, and help a song find its people.</p></div><div className="social-bottom-note-stats"><span><Play size={13}/> 3 sounds finding their way</span><span><MessageCircle size={13}/> {game.relationships.length} conversations open</span><span><Users size={13}/> Every city listening</span></div></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}><span className="back-link">Every post changes a small part of the story.</span><Link className="pill-button" href="/">RETURN TO YOUR WORLD</Link></div>
    </section>
  </main>;
}
