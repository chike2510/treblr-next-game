'use client';

import { ArrowLeft, ArrowRight, AudioLines, Banknote, Check, Clock3, Disc3, Headphones, Mic2, Music2, Radio, Sparkles, Wallet } from 'lucide-react';
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CAMPAIGN_PLANS, type CampaignTier, type Song, type SongStatus } from '@/lib/game-rules';
import { useGame } from '@/lib/game';

const genres = ['Afro-fusion', 'Afrobeats', 'Alt R&B', 'UK garage', 'Amapiano', 'Alternative', 'Pop'];
const moods = ['Midnight', 'Golden hour', 'Restless', 'Hopeful', 'Wistful', 'Unbothered'];
const inspirations = ['A room at 2am', 'Something I miss', 'First train out', 'A softer ending', 'The city after rain', 'A voice note from home'];
const stages: SongStatus[] = ['IDEA', 'DEMO', 'FINISHED', 'SCHEDULED', 'RELEASED'];
const cash = (amount: number) => `$${amount.toLocaleString()}`;

function stageIndex(status: SongStatus) {
  if (status === 'ARCHIVED') return -1;
  return stages.indexOf(status);
}

export default function StudioPage() {
  const game = useGame();
  const [title, setTitle] = useState('Blue Hour, Again');
  const [genre, setGenre] = useState(game.artist.genre);
  const [mood, setMood] = useState('Midnight');
  const [bpm, setBpm] = useState(104);
  const [inspiration, setInspiration] = useState(inspirations[0]);
  const [releaseDay, setReleaseDay] = useState(game.day + 2);
  const [campaign, setCampaign] = useState<CampaignTier>('community');
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { void useGame.persist.rehydrate(); }, []);
  const activeSongs = useMemo(() => game.songs.filter((song) => song.status !== 'ARCHIVED'), [game.songs]);
  useEffect(() => {
    if (!selectedId || !activeSongs.some((song) => song.id === selectedId)) setSelectedId(activeSongs.find((song) => song.status !== 'RELEASED')?.id ?? activeSongs[0]?.id ?? '');
  }, [activeSongs, selectedId]);
  useEffect(() => {
    if (!game.lastEvent) return;
    setMessage(game.lastEvent);
    const timeout = window.setTimeout(() => setMessage(''), 4800);
    return () => window.clearTimeout(timeout);
  }, [game.lastEvent]);

  const selectedSong = activeSongs.find((song) => song.id === selectedId);
  const plan = CAMPAIGN_PLANS[campaign];
  const predictedStreams = selectedSong ? Math.round((2600 + selectedSong.quality * 390 + game.fans * .014 + game.hype * 80 + (selectedSong.genre === game.artist.genre ? 1400 : 0) + plan.budget * 14) * (plan.budget ? plan.reachMultiplier : 1)) : 0;
  const demoQuality = Math.min(95, Math.max(40, Math.round(38 + game.creativity * .32 + game.energy * .22 + (genre === game.artist.genre ? 8 : 4) + (mood ? 3 : 0))));

  const createIdea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    game.createIdea({ title, genre, mood, bpm, inspiration });
    setTitle('');
  };

  const selectSong = (song: Song) => setSelectedId(song.id);
  const dateChoices = [1, 2, 3, 4, 5].map((offset) => game.day + offset);

  return <main className="studio-page">
    <header className="site-header studio-header">
      <Link href="/" className="site-logo">TREBLR</Link>
      <div className="studio-header-links"><Link href="/" className="back-link"><ArrowLeft size={13}/> BACK TO YOUR WORLD</Link><button className="pill-button studio-end-day" onClick={game.advanceDay}>END DAY · DAY {game.day}</button></div>
    </header>

    <section className="studio-hero">
      <div className="studio-hero-copy">
        <div className="eyebrow" style={{ color: '#b06e4c' }}>THE RED-LIGHT ROOM · {game.currentCity.toUpperCase()}</div>
        <h1>Make a record<br/>that sounds <em>like you.</em></h1>
        <p>Start with a feeling. Shape it into a demo, finish the master, then choose when and how the world hears it. Every stage has a cost, a choice, and a reason.</p>
        <div className="studio-hero-meta"><span><Wallet size={15}/> {cash(game.money)} cash</span><span><Sparkles size={15}/> {game.energy}% energy</span><span><Clock3 size={15}/> Day {game.day} · {game.time}</span></div>
      </div>
      <div className="studio-record-visual" aria-label="Abstract album artwork for a song in progress"><div className="record-glow"/><div className="record-disc"><div className="record-center">T.</div></div><div className="studio-note"><span className="studio-live-dot"/> SESSION OPEN <small>INPUT 01 · {game.currentCity.toUpperCase()}</small></div></div>
    </section>

    <div className="studio-stepper" aria-label="Song creation stages">{stages.map((stage, index) => <div className={`studio-step ${selectedSong && stageIndex(selectedSong.status) >= index ? 'done' : ''} ${selectedSong?.status === stage ? 'current' : ''}`} key={stage}><span>{selectedSong && stageIndex(selectedSong.status) > index ? <Check size={14}/> : `0${index + 1}`}</span><div><b>{stage === 'IDEA' ? 'Idea' : stage === 'DEMO' ? 'Demo' : stage === 'FINISHED' ? 'Master' : stage === 'SCHEDULED' ? 'Rollout' : 'Release'}</b><small>{stage === 'IDEA' ? 'Find the feeling' : stage === 'DEMO' ? 'Record a take' : stage === 'FINISHED' ? 'Finish the sound' : stage === 'SCHEDULED' ? 'Set the date' : 'Meet the audience'}</small></div></div>)}</div>

    <div className="studio-columns">
      <section className="studio-panel studio-idea-panel">
        <div className="studio-panel-head"><div><div className="eyebrow">01 · THE FIRST SPARK</div><h2>Start a new idea.</h2></div><span className="studio-icon"><Mic2 size={18}/></span></div>
        <p className="studio-intro">A title is just a doorway. Pick a sound and a moment from your day; you can change the arrangement as it grows.</p>
        <form onSubmit={createIdea}>
          <label className="form-label" htmlFor="song-title">Working title</label><input id="song-title" className="field" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={48} placeholder="Name the feeling" required/>
          <div className="field-row"><div><label className="form-label" htmlFor="song-genre">Sound palette</label><select id="song-genre" className="field" value={genre} onChange={(event) => setGenre(event.target.value)}>{genres.map((item) => <option key={item}>{item}</option>)}</select></div><div><label className="form-label" htmlFor="song-mood">Emotional colour</label><select id="song-mood" className="field" value={mood} onChange={(event) => setMood(event.target.value)}>{moods.map((item) => <option key={item}>{item}</option>)}</select></div></div>
          <label className="form-label" htmlFor="song-inspiration">Pull from the day</label><select id="song-inspiration" className="field" value={inspiration} onChange={(event) => setInspiration(event.target.value)}>{inspirations.map((item) => <option key={item}>{item}</option>)}</select>
          <div className="studio-tempo-control"><div><label className="form-label" htmlFor="song-bpm">Tempo · BPM</label><small>Set the pulse, not the pressure.</small></div><div className="tempo-stepper"><button type="button" aria-label="Decrease tempo" onClick={() => setBpm((value) => Math.max(60, value - 2))}>−</button><output htmlFor="song-bpm">{bpm}</output><button type="button" aria-label="Increase tempo" onClick={() => setBpm((value) => Math.min(180, value + 2))}>+</button></div></div>
          <div className="quality-preview"><div className="quality-ring" style={{ '--quality': `${demoQuality}%` } as React.CSSProperties}><b>{demoQuality}</b></div><div><b>Demo potential</b><span>Estimated from energy, creativity, and genre fit. The actual take resolves when you book the session.</span></div></div>
          <button className="pill-button orange studio-primary" type="submit"><Sparkles size={14}/> SAVE THE IDEA <ArrowRight size={14}/></button>
        </form>
      </section>

      <section className="studio-panel studio-workspace-panel">
        <div className="studio-panel-head"><div><div className="eyebrow">02–05 · THE RECORD</div><h2>Your song pipeline.</h2></div><span className="studio-icon"><AudioLines size={18}/></span></div>
        <p className="studio-intro">Songs can only move forward one stage at a time. Your next valid action appears on each track; nothing jumps straight from idea to release.</p>
        {activeSongs.length ? <div className="studio-track-list">{activeSongs.map((song) => <SongWorkflowCard key={song.id} song={song} selected={song.id === selectedId} onSelect={() => selectSong(song)} game={game} releaseDay={releaseDay} setReleaseDay={setReleaseDay} campaign={campaign} setCampaign={setCampaign} planBudget={CAMPAIGN_PLANS[campaign].budget} predictedStreams={predictedStreams}/>)}</div> : <div className="studio-empty"><Disc3 size={26}/><b>No songs in the room yet.</b><span>Save an idea and begin the first record.</span></div>}
      </section>
    </div>

    <section className="studio-panel studio-session-panel">
      <div className="studio-panel-head"><div><div className="eyebrow">THE SESSION AGREEMENT</div><h2>Choices leave a mark.</h2></div><span className="studio-icon"><Headphones size={18}/></span></div>
      <div className="studio-session-grid"><article><span>01 · RECORD</span><b>$125 · 18 energy</b><p>Move an idea to demo. Take quality responds to your energy, creativity, and genre fit.</p></article><article><span>02 · FINISH</span><b>Teo: $210 · 12 energy</b><p>Teo’s Lagos mix lifts the quality more and deepens trust. A self-finish is free, but uses 8 energy and gives a smaller lift.</p></article><article><span>03 · RELEASE</span><b>$0 / $300 / $900</b><p>Pick organic, community, or citywide promotion. Campaign spend is paid when you schedule; streams and royalties arrive on release day.</p></article></div>
    </section>

    <section className="studio-bottom-row">
      <div className="studio-narrative-card"><div className="eyebrow">THIS WEEK IN LAGOS</div><h2>{game.chapterStage}.</h2><p>Teo’s invitation is still on the table. Make the record at your pace; the city will answer when you let it out.</p><Link href="/" className="back-link">RETURN TO THE APARTMENT <ArrowRight size={13}/></Link></div>
      <div className="studio-ledger-card"><div className="studio-panel-head"><div><div className="eyebrow">CASH FLOW</div><h3>Recent music costs & income</h3></div><Banknote size={18}/></div>{game.ledger.slice(0, 4).map((entry) => <div className="studio-ledger-row" key={entry.id}><span><b>{entry.description}</b><small>Day {entry.day} · {entry.bucket}</small></span><strong className={entry.amount >= 0 ? 'positive' : 'negative'}>{entry.amount >= 0 ? '+' : '−'}{cash(Math.abs(entry.amount))}</strong></div>)}</div>
    </section>
    
    {message && <div className="toast studio-toast" role="status">{message}</div>}
  </main>;
}

function SongWorkflowCard({
  song, selected, onSelect, game, releaseDay, setReleaseDay, campaign, setCampaign, planBudget, predictedStreams,
}: {
  song: Song; selected: boolean; onSelect: () => void; game: ReturnType<typeof useGame.getState>;
  releaseDay: number; setReleaseDay: (day: number) => void; campaign: CampaignTier; setCampaign: (tier: CampaignTier) => void;
  planBudget: number; predictedStreams: number;
}) {
  const currentIndex = stageIndex(song.status);
  const statusText = song.status === 'IDEA' ? 'Raw thought · not recorded' : song.status === 'DEMO' ? 'First take · ready for a mix' : song.status === 'FINISHED' ? 'Master ready · rollout is yours' : song.status === 'SCHEDULED' ? `Scheduled · day ${song.releaseDay}` : song.status === 'RELEASED' ? `Released · ${(song.streams / 1000).toFixed(1)}K total streams` : 'Archived';
  return <article className={`studio-track-card ${selected ? 'selected' : ''}`}>
    <button type="button" className="studio-track-select" onClick={onSelect} aria-pressed={selected}><span className="studio-track-cover"><Disc3 size={20}/></span><span className="studio-track-main"><b>{song.title}</b><small>{song.genre} · {song.mood} · {song.bpm} BPM</small><small>{statusText}</small></span><span className={`studio-status status-${song.status.toLowerCase()}`}>{song.status}</span></button>
    {song.status !== 'ARCHIVED' && <div className="studio-mini-progress">{stages.map((stage, index) => <span key={stage} className={currentIndex >= index ? 'done' : ''} title={stage}/>)}</div>}
    {song.status === 'IDEA' && <div className="studio-action-box"><div><b>Next · record a demo take</b><span>$125 cash · 18 energy · current estimated quality {Math.min(95, Math.max(40, Math.round(38 + game.creativity * .32 + game.energy * .22 + (song.genre === game.artist.genre ? 8 : 4) + 3)))}/100</span></div><button className="pill-button orange small" disabled={game.money < 125 || game.energy < 20} onClick={() => game.recordSong(song.id)}><Mic2 size={12}/> RECORD</button></div>}
    {song.status === 'DEMO' && <div className="studio-action-box studio-choice-actions"><div><b>Next · finish the master</b><span>Choose a collaborator or keep the mix in-house.</span></div><div className="studio-action-buttons"><button className="pill-button small" disabled={game.money < 210 || game.energy < 12 || game.currentCity !== 'Lagos'} onClick={() => game.finishSong(song.id, 'Teo Park')}><Headphones size={12}/> TEO · $210</button><button className="pill-button ghost small" disabled={game.energy < 8} onClick={() => game.finishSong(song.id, 'Self')}>SELF · FREE</button></div><small className="studio-action-footnote">Teo’s room is in Lagos · his mix adds +10 quality and trust; self-finish adds +5.</small></div>}
    {song.status === 'FINISHED' && <div className="studio-release-planner"><div className="studio-release-planner-title"><b>Next · schedule the release</b><span>Promotion is charged now; royalties arrive on release day.</span></div><div className="release-controls"><label>Release date<select className="field" value={releaseDay} onChange={(event) => setReleaseDay(Number(event.target.value))}>{[1, 2, 3, 4, 5].map((offset) => <option key={offset} value={game.day + offset}>Day {game.day + offset}{offset === 1 ? ' · tomorrow' : ` · ${offset} days`}</option>)}</select></label><label>Rollout<select className="field" value={campaign} onChange={(event) => setCampaign(event.target.value as CampaignTier)}><option value="organic">Organic · no spend</option><option value="community">Community push · $300</option><option value="city-push">Citywide campaign · $900</option></select></label></div><div className="studio-forecast-line"><span><Radio size={13}/> {selected ? predictedStreams.toLocaleString() : song.quality.toLocaleString()} estimated first-day streams</span><b>{planBudget ? `−${cash(planBudget)}` : 'No spend'}</b></div><button className="pill-button orange studio-primary" disabled={game.money < planBudget} onClick={() => game.scheduleSong(song.id, releaseDay, campaign)}>SET RELEASE DATE <ArrowRight size={13}/></button></div>}
    {song.status === 'SCHEDULED' && <div className="studio-action-box scheduled-box"><div><b>Release is on the calendar</b><span>{song.releaseDay! - game.day} in-game day{song.releaseDay! - game.day === 1 ? '' : 's'} to go · {song.campaign ? CAMPAIGN_PLANS[song.campaign].label : 'Organic release'} · campaign paid.</span></div><span className="scheduled-badge"><Clock3 size={13}/> DAY {song.releaseDay}</span></div>}
    {song.status === 'RELEASED' && <div className="studio-action-box released-box"><div><b>The city has heard it.</b><span>Last in-game day: {(song.lastDailyStreams ?? 0).toLocaleString()} streams · $${Math.round((song.lastDailyStreams ?? 0) * .003).toLocaleString()} catalog royalties on the next day-end.</span></div><span className="released-badge"><Check size={13}/> LIVE</span></div>}
    {song.status !== 'RELEASED' && song.status !== 'ARCHIVED' && <button className="studio-archive" onClick={() => game.archiveSong(song.id)}>ARCHIVE IDEA</button>}
  </article>;
}
