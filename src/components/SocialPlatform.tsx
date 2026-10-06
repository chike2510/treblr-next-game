'use client';

import { ArrowLeft, ArrowUpRight, BadgeCheck, Check, Disc3, Heart, Music2, Users, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useGame } from '@/lib/game';
import { socialPostRequirements } from '@/lib/game-rules';

type SocialPage = { name: string; mark: string; color: string; family: string; mode: string; action: string; choices?: [string, string][]; }
const pages: Record<string, SocialPage> = {
  instagram: { name: 'Instagram', mark: 'ig', color: 'linear-gradient(145deg,#a947ab,#ed9558)', family: 'Moments', mode: 'photo', action: 'Save a photo moment', choices: [['photo', 'Photo moment'], ['backstage', 'Backstage note']] },
  tiktok: { name: 'TikTok', mark: '♪', color: 'linear-gradient(145deg,#19191d,#55515a)', family: 'Snippets', mode: 'snippet', action: 'Save a song snippet', choices: [['snippet', 'Song snippet'], ['trend-reply', 'Reply to a trend']] },
  x: { name: 'X', mark: 'X', color: '#242226', family: 'Notes', mode: 'post', action: 'Save a note', choices: [['post', 'Short post'], ['trend-reply', 'Trend reply']] },
  youtube: { name: 'YouTube', mark: '▶', color: 'linear-gradient(145deg,#e9584e,#a92939)', family: 'Video', mode: 'video', action: 'Save a video idea', choices: [['video', 'Music video'], ['interview', 'Studio interview'], ['live', 'Live performance']] },
  spotify: { name: 'Spotify', mark: '≋', color: 'linear-gradient(145deg,#57c887,#227c53)', family: 'Catalog', mode: 'post', action: 'Open music studio' },
  'apple-music': { name: 'Apple Music', mark: '♫', color: 'linear-gradient(145deg,#ef718a,#9d305c)', family: 'Catalog', mode: 'post', action: 'Open music studio' },
  soundcloud: { name: 'SoundCloud', mark: '☁', color: 'linear-gradient(145deg,#ff9b3d,#df512b)', family: 'Track notes', mode: 'repost', action: 'Save a track note', choices: [['repost', 'Repost a track'], ['comment', 'Track note']] },
  audiomack: { name: 'Audiomack', mark: 'a', color: 'linear-gradient(145deg,#ffc247,#dd8428)', family: 'Mixtape', mode: 'post', action: 'Save a mixtape note' },
  threads: { name: 'Threads', mark: '@', color: '#333037', family: 'Conversation', mode: 'thread', action: 'Save a thread', choices: [['thread', 'Start a thread'], ['reply', 'Reply to a conversation']] },
  facebook: { name: 'Facebook', mark: 'f', color: 'linear-gradient(145deg,#5a8bea,#3656a7)', family: 'People & events', mode: 'event', action: 'Save an event note', choices: [['event', 'Event note'], ['post', 'Page note']] },
  twitch: { name: 'Twitch', mark: '▣', color: 'linear-gradient(145deg,#a776ef,#5d43a6)', family: 'Live writing', mode: 'live', action: 'Save a live-session note', choices: [['live', 'Live session'], ['community', 'Community note']] },
  snapchat: { name: 'Snapchat', mark: '◉', color: 'linear-gradient(145deg,#ffe658,#e6b92c)', family: 'Quick stories', mode: 'story', action: 'Save a story note' },
};
const short = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${Math.round(n / 1000)}K`;

export default function SocialPlatform({ slug }: { slug: string }) {
  const game = useGame();
  const [composer, setComposer] = useState(false);
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState(pages[slug]?.mode ?? 'post');
  useEffect(() => { void useGame.persist.rehydrate(); }, []);
  const platform = pages[slug];
  const posts = useMemo(() => game.posts.filter((post) => post.platform === platform?.name), [game.posts, platform?.name]);
  if (!platform) return <main className="platform-page"><header className="site-header"><Link href="/" className="site-logo">TREBLR</Link></header><div className="platform-layout"><h1>This part of the story is still quiet.</h1><Link href="/social" className="pill-button">BACK TO SOCIAL</Link></div></main>;
  const streaming = slug === 'spotify' || slug === 'apple-music';
  const requirements = socialPostRequirements(platform.name, mode);
  const blocked = game.money < requirements.cash || game.energy < requirements.energy;
  const options = platform.choices ?? [[platform.mode, platform.family]];
  const saveMoment = () => {
    if (!draft.trim() || blocked) return;
    game.publishPost(platform.name, draft, mode);
    setDraft('');
    setComposer(false);
  };
  const savedSongs = game.songs.filter((song) => song.status !== 'ARCHIVED');
  const released = savedSongs.filter((song) => song.status === 'RELEASED');
  return <main className={`platform-page social-save-page social-save-${slug}`}>
    <header className="site-header"><Link href="/" className="site-logo">TREBLR</Link><Link href="/social" className="back-link"><ArrowLeft size={13}/> All phone apps</Link></header>
    <section className="platform-layout">
      <div className="social-save-banner" style={{ background: `linear-gradient(120deg,#2b222b,#73504b 59%,${slug === 'spotify' ? '#47765b' : '#c88b63'})` }}>
        <div className="social-save-brand"><span className="platform-mark" style={{ background: platform.color }}>{platform.mark}</span><span><div className="eyebrow">{platform.name.toUpperCase()} · {platform.family.toUpperCase()}</div><strong>{game.artist.handle} <BadgeCheck size={13}/></strong></span><span className="social-save-local"><Check size={11}/> LOCAL SAVE</span></div>
        <h1>{streaming ? 'The songs live here.' : 'A voice, in its own room.'}</h1>
        <p>{game.artist.genre} · {game.currentCity}. This is a fictional view of your in-game music life.</p>
        <div className="social-save-stats"><div><span>{streaming ? 'MODELED MONTHLY LISTENERS' : 'IN-GAME FANS'}</span><b>{streaming ? game.monthlyListeners.toLocaleString() : game.fans.toLocaleString()}</b></div><div><span>ENERGY</span><b>{game.energy}%</b></div><div><span>YOUR SAVED MOMENTS</span><b>{posts.length}</b></div></div>
      </div>
      <div className="social-save-localnote"><Wallet size={14}/> Actions check this save’s cash, energy, songs and audience. No social or streaming service is contacted.</div>
      {!streaming && <section className="social-save-compose"><div><div className="eyebrow" style={{ color: '#a36f55' }}>A SMALL THING TO SHARE</div><h2>{platform.action}</h2><p>It stays in your browser and changes only this game.</p></div><button className="pill-button orange" onClick={() => setComposer(!composer)}>{composer ? 'CLOSE' : 'WRITE'}</button></section>}
      {!streaming && composer && <div className="social-save-editor"><label className="form-label">The kind of moment<select className="field" value={mode} onChange={(event) => setMode(event.target.value)}>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><textarea className="field" value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} maxLength={280} placeholder="Use your own words…"/><div className="social-save-editor-foot"><span>{draft.length}/280 · {requirements.cash ? `$${requirements.cash} + ` : ''}{requirements.energy} energy</span><button className="pill-button orange" disabled={!draft.trim() || blocked} onClick={saveMoment}>{blocked ? 'NOT ENOUGH RESOURCES' : 'SAVE TO THIS GAME'}</button></div>{blocked && <p className="social-save-blocked">This action needs {requirements.cash ? `${requirements.cash} cash and ` : ''}{requirements.energy} energy. Rest or earn cash first.</p>}</div>}
      <div className="social-save-columns"><section className="social-save-pane"><div className="social-save-section-head"><div><div className="eyebrow" style={{ color: '#a36f55' }}>{streaming ? 'IN THE CATALOG' : 'THE WORK BEHIND THE MOMENT'}</div><h2>{streaming ? `${released.length} released ${released.length === 1 ? 'song' : 'songs'}` : `${savedSongs.length} songs in your save`}</h2></div><Music2 size={18} color="#aa7356"/></div>{savedSongs.length ? savedSongs.map((song) => <article className="social-save-song" key={song.id}><span className={`social-save-cover status-${song.status.toLowerCase()}`}><Disc3 size={17}/></span><span><b>{song.title}</b><small>{song.genre} · {song.status.toLowerCase()} · {song.quality} quality</small></span><span className="social-save-song-value">{song.status === 'RELEASED' ? <><b>{song.streams.toLocaleString()}</b><small>in-game streams</small></> : <small>not released</small>}</span>{song.status !== 'RELEASED' && <Link href="/studio" className="social-save-open">STUDIO <ArrowUpRight size={11}/></Link>}</article>) : <p className="social-save-empty">No songs have been added to this save yet.</p>}</section>
        <section className="social-save-pane"><div className="social-save-section-head"><div><div className="eyebrow" style={{ color: '#a36f55' }}>THIS SAVE ONLY</div><h2>{posts.length ? `${posts.length} saved ${posts.length === 1 ? 'moment' : 'moments'}` : 'Nothing posted here yet'}</h2></div><Heart size={17} color="#aa7356"/></div>{posts.length ? posts.map((post, index) => <article className="social-save-post" key={`${post.time}-${index}-${post.text}`}><div className="social-save-post-meta">{game.artist.handle} <span>·</span> {post.time} <span>·</span> {post.mode?.replaceAll('-', ' ') ?? 'moment'}</div><p>{post.text}</p><div className="social-save-post-note">Saved to this game · not published externally</div></article>) : <p className="social-save-empty">Saved moments will appear here after you write one. Nothing from this page is sent to a real account.</p>}</section></div>
      <div className="social-save-bottom"><Users size={14}/><span>The whole story is local: {game.relationships.length} open conversations · {short(game.fans)} in-game fans · {game.time} on Day {game.day}.</span></div>
    </section>
  </main>;
}
