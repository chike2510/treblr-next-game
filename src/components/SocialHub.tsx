'use client';

import { ArrowUpRight, BadgeCheck, ChevronLeft, Disc3, MessageCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useGame } from '@/lib/game';

const platforms = [
  { name: 'Instagram', path: 'instagram', label: 'Small moments · the photo roll', icon: 'ig', color: 'linear-gradient(145deg,#ab3eb0,#f19550)' },
  { name: 'TikTok', path: 'tiktok', label: 'Snippets · the first listen', icon: '♪', color: 'linear-gradient(145deg,#161619,#4d4b53)' },
  { name: 'X', path: 'x', label: 'Notes · the conversation', icon: 'X', color: '#17171a' },
  { name: 'YouTube', path: 'youtube', label: 'Video · studio and stage', icon: '▶', color: 'linear-gradient(145deg,#ef564d,#b82739)' },
  { name: 'Spotify', path: 'spotify', label: 'Released songs · modeled streams', icon: '≋', color: 'linear-gradient(145deg,#54d394,#218150)' },
  { name: 'Apple Music', path: 'apple-music', label: 'The same catalog · in this story', icon: '♫', color: 'linear-gradient(145deg,#ef718a,#9d305c)' },
  { name: 'SoundCloud', path: 'soundcloud', label: 'Rough cuts · track notes', icon: '☁', color: 'linear-gradient(145deg,#ff9b3d,#df512b)' },
  { name: 'Audiomack', path: 'audiomack', label: 'Mixtapes · songs in progress', icon: 'a', color: 'linear-gradient(145deg,#ffc247,#dd8428)' },
  { name: 'Threads', path: 'threads', label: 'A slower kind of conversation', icon: '@', color: '#28262b' },
  { name: 'Facebook', path: 'facebook', label: 'People · local event notes', icon: 'f', color: 'linear-gradient(145deg,#5a8bea,#3656a7)' },
  { name: 'Twitch', path: 'twitch', label: 'Live writing · community', icon: '▣', color: 'linear-gradient(145deg,#a776ef,#5d43a6)' },
  { name: 'Snapchat', path: 'snapchat', label: 'Quick story · behind the song', icon: '◉', color: 'linear-gradient(145deg,#ffe658,#e6b92c)' },
];
const fmt = (n: number) => n.toLocaleString();
const streamingPlatforms = new Set(['Spotify', 'Apple Music']);

export default function SocialHub() {
  const game = useGame();
  useEffect(() => { void useGame.persist.rehydrate(); }, []);
  return <main className="social-hub-page">
    <header className="site-header"><Link href="/" className="site-logo">TREBLR</Link><Link href="/" className="back-link"><ChevronLeft size={13} style={{ verticalAlign: 'middle' }}/> Back to the apartment</Link></header>
    <section className="social-main social-local-main">
      <div className="social-title"><div><div className="eyebrow" style={{ color: '#aa7356' }}>THE PHONE · A LOCAL SIMULATION</div><h1>Your voice,<br/>kept in this story.</h1><p>Choose a platform-inspired view. Saved moments affect this game’s mood, energy and audience; nothing is sent to a real social account.</p></div><div className="social-mini-stats"><div className="mini-stat"><span>IN-GAME FANS</span><b>{fmt(game.fans)}</b></div><div className="mini-stat"><span>MODELED MONTHLY LISTENERS</span><b>{fmt(game.monthlyListeners)}</b></div><div className="mini-stat"><span>MOMENTS SAVED HERE</span><b>{game.posts.length}</b></div></div></div>
      <div className="social-local-note"><BadgeCheck size={15}/> These counts are read from your browser save, not a connected platform account.</div>
      <div className="social-grid">{platforms.map((platform) => {
        const posts = game.posts.filter((post) => post.platform === platform.name).length;
        const releases = game.songs.filter((song) => song.status === 'RELEASED').length;
        return <Link href={`/social/${platform.path}`} className="social-card" key={platform.path}>
          <span className="platform-mark" style={{ background: platform.color, color: platform.name === 'Snapchat' ? '#28231c' : 'white' }}>{platform.icon}</span>
          <span className="social-copy"><strong>{platform.name}</strong><p>{platform.label}</p></span>
          <span className="social-stats"><b>{streamingPlatforms.has(platform.name) ? releases : posts}</b><small>{streamingPlatforms.has(platform.name) ? 'released songs in this save' : posts === 1 ? 'saved moment' : 'saved moments'}</small></span><ArrowUpRight size={15} color="#9b8b83"/>
        </Link>;
      })}</div>
      <div className="social-bottom-note"><div><div className="eyebrow">LOCAL ONLY · NO REAL POSTS</div><p><Disc3 size={14}/> Your releases, streams and fans move only when this game save changes.</p></div><div className="social-bottom-note-stats"><span><MessageCircle size={13}/> {game.relationships.length} saved conversations</span><span><Users size={13}/> {game.fans.toLocaleString()} in-game fans</span></div></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}><span className="back-link">Nothing here is linked to Instagram, TikTok, or a streaming service.</span><Link className="pill-button" href="/">RETURN TO YOUR WORLD</Link></div>
    </section>
  </main>;
}
