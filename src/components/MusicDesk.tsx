'use client';

import { useMemo, useState } from 'react';
import { BarChart3, Check, Disc3, Megaphone, Music2, Play, Plus, Radio, Sparkles, X } from 'lucide-react';
import { useGame, type Song } from '@/lib/game';
import { CAMPAIGN_CHANNELS, campaignExpectedReach, type CampaignChannel, type SongCampaign } from '@/lib/career-rules';
import '@/styles/music-desk.css';

const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  video: 'Video', radio: 'Radio', press: 'Press', interview: 'Interview', creator: 'Creator', live: 'Live',
};
const CHANNEL_ORDER: CampaignChannel[] = ['video', 'radio', 'press', 'interview', 'creator', 'live'];
const compact = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : value >= 1_000 ? `${Math.round(value / 100) / 10}K` : String(value);
const money = (value: number) => `$${Math.max(0, Math.round(value)).toLocaleString()}`;
const statusLabel = (status: Song['status']) => ({ IDEA: 'Idea', DEMO: 'Demo', FINISHED: 'Mastered', SCHEDULED: 'Scheduled', RELEASED: 'Released', ARCHIVED: 'Archived' }[status]);
const campaignStatus = (status: SongCampaign['status']) => status.charAt(0) + status.slice(1).toLowerCase();

export default function MusicDesk() {
  const game = useGame();
  const [selectedId, setSelectedId] = useState(game.songs.find((song) => song.status === 'RELEASED')?.id ?? game.songs.find((song) => song.status !== 'ARCHIVED')?.id ?? '');
  const [message, setMessage] = useState('');
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumSongs, setAlbumSongs] = useState<string[]>([]);

  const visibleSongs = game.songs;
  const selected = visibleSongs.find((song) => song.id === selectedId) ?? visibleSongs[0];
  const released = visibleSongs.filter((song) => song.status === 'RELEASED');
  const totalStreams = released.reduce((total, song) => total + song.streams, 0);
  const selectedCampaigns = selected ? game.songCampaigns.filter((campaign) => campaign.songId === selected.id).slice().reverse() : [];

  const setNotice = (next: string) => setMessage(next);
  const run = (action: () => void, success: string) => {
    try { action(); setNotice(useGame.getState().lastEvent || success); } catch (error) { setNotice(error instanceof Error ? error.message : 'That action could not be completed.'); }
  };
  const toggleAlbumSong = (id: string) => setAlbumSongs((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 12 ? [...current, id] : current);
  const createAlbum = () => {
    if (albumSongs.length < 2) { setNotice('Choose at least two existing songs for an album project.'); return; }
    if (!albumTitle.trim()) { setNotice('Give the project a title before creating it.'); return; }
    run(() => game.createAlbumProject(albumTitle.trim(), albumSongs), 'Album project created. Choose a focus track, then release when the project is ready.');
    setAlbumTitle(''); setAlbumSongs([]);
  };
  const promoteSong = (songId: string, channel: CampaignChannel) => {
    const song = visibleSongs.find((item) => item.id === songId);
    if (!song) return;
    const plan = CAMPAIGN_CHANNELS[channel];
    if (song.status !== 'RELEASED') { setNotice('Release this song before planning a campaign.'); return; }
    if (game.money < plan.cost || game.energy < plan.energy) { setNotice(`Not enough resources: ${money(plan.cost)} cash and ${plan.energy} energy required.`); return; }
    run(() => game.planCampaign(song.id, channel, game.day, plan.days), `${CHANNEL_LABELS[channel]} campaign planned for ${song.title}.`);
  };
  const promote = (channel: CampaignChannel) => { if (selected) promoteSong(selected.id, channel); };
  const focusTrack = (projectId: string, songId: string) => {
    run(() => game.setAlbumFocusTrack(projectId, songId), 'Focus track saved.');
  };
  const releaseProject = (projectId: string) => run(() => game.releaseAlbum(projectId), 'Album released through the engine.');

  const analytics = useMemo(() => released.map((song) => ({ song, share: totalStreams ? Math.round(song.streams / totalStreams * 100) : 0 })), [released, totalStreams]);

  return <section className="music-desk" aria-labelledby="music-desk-title">
    <header className="music-desk__masthead">
      <div><span className="music-desk__kicker">CATALOGUE CONTROL · DAY {game.day}</span><h1 id="music-desk-title">Music desk</h1><p>Turn finished songs into releases, campaigns, and a body of work you can read.</p></div>
      <div className="music-desk__signal" aria-hidden="true"><Disc3 size={34}/><span>{released.length} live</span></div>
    </header>
    {message && <div className="music-desk__notice" role="status"><Sparkles size={15}/><span>{message}</span><button type="button" onClick={() => setMessage('')} aria-label="Dismiss message"><X size={15}/></button></div>}

    <div className="music-desk__layout">
      <aside className="music-desk__rail" aria-label="Song catalogue">
        <div className="music-desk__section-head"><div><span className="music-desk__kicker">THE CATALOGUE</span><h2>Tracks</h2></div><span className="music-desk__count">{visibleSongs.length}</span></div>
        {visibleSongs.length ? <div className="music-desk__track-list">{visibleSongs.map((song, index) => <button type="button" key={song.id} className={`music-track ${song.id === selected?.id ? 'is-selected' : ''}`} onClick={() => setSelectedId(song.id)}><span className="music-track__index">{String(index + 1).padStart(2, '0')}</span><span className="music-track__body"><strong>{song.title}</strong><small>{song.genre} · {statusLabel(song.status)}</small></span><span className={`music-track__status music-track__status--${song.status.toLowerCase()}`}>{song.status === 'RELEASED' ? compact(song.streams) : song.quality}</span></button>)}</div> : <p className="music-desk__empty">Your desk is clear. Start a song in the studio.</p>}
      </aside>

      <main className="music-desk__main">
        {selected ? <>
          <article className="music-desk__record">
            <div className="music-desk__record-art"><Music2 size={42}/><span>{selected.genre}</span></div>
            <div className="music-desk__record-copy"><span className="music-desk__kicker">SELECTED RECORD · {statusLabel(selected.status)}</span><h2>{selected.title}</h2><p>{selected.mood} mood · {selected.bpm} BPM · produced by {selected.producer}</p><div className="music-desk__quality"><span>QUALITY</span><strong>{selected.quality}<small>/100</small></strong><i><b style={{ width: `${selected.quality}%` }}/></i></div></div>
            <div className="music-desk__record-stat"><span>STREAMS</span><strong>{compact(selected.streams)}</strong>{selected.releasedOnDay ? <small>Live since day {selected.releasedOnDay}</small> : selected.releaseDay ? <small>Release day {selected.releaseDay}</small> : <small>Not released</small>}</div>
          </article>

          <section className="music-desk__panel music-desk__campaign" aria-labelledby="campaign-title">
            <div className="music-desk__section-head"><div><span className="music-desk__kicker">MAKE THE NEXT MOVE</span><h2 id="campaign-title">Campaign desk</h2></div><Megaphone size={20}/></div>
            {selected.status === 'RELEASED' ? <><p className="music-desk__lede">Choose where this record travels. Costs and expected reach come from the engine; results land when the campaign completes.</p><div className="music-desk__channel-grid">{CHANNEL_ORDER.map((channel) => { const plan = CAMPAIGN_CHANNELS[channel]; const unavailable = game.money < plan.cost || game.energy < plan.energy; return <button type="button" className="campaign-option" key={channel} onClick={() => promote(channel)} disabled={unavailable} title={unavailable ? `Requires ${money(plan.cost)} and ${plan.energy} energy` : `Plan ${CHANNEL_LABELS[channel]} campaign`}><span className="campaign-option__icon">{channel === 'radio' ? <Radio size={16}/> : channel === 'live' ? <Play size={16}/> : <Megaphone size={16}/>}</span><span><strong>{CHANNEL_LABELS[channel]}</strong><small>{money(plan.cost)} · {plan.energy} energy</small><small>~{compact(campaignExpectedReach(selected, channel, game.fans, game.hype, game.skills.BUSINESS))} reach · {plan.days}d</small></span><Plus size={15}/></button>; })}</div></> : <div className="music-desk__locked"><span>{selected.status === 'SCHEDULED' ? 'This song is scheduled, but promotion unlocks after it is released.' : selected.status === 'FINISHED' ? 'Master complete. Schedule or release it before promotion.' : 'Promotion unlocks once this song is released.'}</span></div>}
            {selectedCampaigns.length ? <div className="music-desk__campaign-log"><h3>Campaign history</h3>{selectedCampaigns.map((campaign) => <div className="campaign-result" key={campaign.id}><div><strong>{CHANNEL_LABELS[campaign.channel]}</strong><span>Day {campaign.startDay}–{campaign.endDay} · {campaignStatus(campaign.status)}</span></div><div className="campaign-result__numbers"><span>Reach <b>{campaign.measuredReach ? compact(campaign.measuredReach) : `~${compact(campaign.expectedReach)}`}</b></span><span>Fans <b>{campaign.measuredFans ? `+${compact(campaign.measuredFans)}` : 'pending'}</b></span><span>Streams <b>{campaign.measuredStreams ? `+${compact(campaign.measuredStreams)}` : 'pending'}</b></span></div>{campaign.status === 'PLANNED' || campaign.status === 'ACTIVE' ? <button type="button" className="text-action" onClick={() => run(() => game.cancelCampaign(campaign.id), 'Campaign cancelled.')}><X size={14}/> Cancel</button> : <Check size={16} aria-label="Campaign complete"/>}</div>)}</div> : <p className="music-desk__empty music-desk__empty--inline">No campaign activity for this record yet.</p>}
          </section>

          <section className="music-desk__panel" aria-labelledby="credits-title"><div className="music-desk__section-head"><div><span className="music-desk__kicker">THE LINER NOTES</span><h2 id="credits-title">Credits & release</h2></div><Music2 size={20}/></div><div className="credit-grid"><div><span>Producer</span><strong>{selected.producer}</strong></div><div><span>Genre</span><strong>{selected.genre}</strong></div><div><span>Released</span><strong>{selected.releasedOnDay ? `Day ${selected.releasedOnDay}` : '—'}</strong></div><div><span>Last daily streams</span><strong>{selected.lastDailyStreams ? compact(selected.lastDailyStreams) : '—'}</strong></div></div>{selected.inspiration && <p className="music-desk__quote">“{selected.inspiration}”</p>}</section>
        </> : <div className="music-desk__blank"><Music2 size={26}/><h2>No song selected</h2><p>Record a song to begin building your catalogue.</p></div>}
      </main>
    </div>

    <section className="music-desk__panel music-desk__analytics" aria-labelledby="analytics-title"><div className="music-desk__section-head"><div><span className="music-desk__kicker">WHAT IS MOVING</span><h2 id="analytics-title">Catalog analytics</h2></div><BarChart3 size={20}/></div>{analytics.length ? <div className="analytics-list">{analytics.map(({ song, share }) => <div className="analytics-row" key={song.id}><div><strong>{song.title}</strong><span>{compact(song.streams)} streams · {share}% contribution</span></div><div className="analytics-bar"><i style={{ width: `${share}%` }}/></div></div>)}</div> : <p className="music-desk__empty">Release a song to see actual streams and contribution by track.</p>}</section>

    <section className="music-desk__panel music-desk__albums" aria-labelledby="album-title"><div className="music-desk__section-head"><div><span className="music-desk__kicker">LONG-FORM WORK</span><h2 id="album-title">Album projects</h2></div><Disc3 size={20}/></div><div className="album-builder"><div className="album-builder__fields"><label htmlFor="album-name">Project title</label><input id="album-name" value={albumTitle} onChange={(event) => setAlbumTitle(event.target.value)} placeholder="Name the project"/><p>Select 2–12 existing, non-archived songs.</p></div><div className="album-builder__songs">{visibleSongs.filter((song) => song.status !== 'ARCHIVED').map((song) => <label className={`album-song ${albumSongs.includes(song.id) ? 'is-selected' : ''}`} key={song.id}><input type="checkbox" checked={albumSongs.includes(song.id)} onChange={() => toggleAlbumSong(song.id)}/><span><strong>{song.title}</strong><small>{statusLabel(song.status)} · Q{song.quality}</small></span><Check size={15}/></label>)}</div><button type="button" className="desk-button desk-button--primary" onClick={createAlbum} disabled={albumSongs.length < 2 || !albumTitle.trim()}><Plus size={16}/> Create project <span>{albumSongs.length}/12</span></button></div>
      {game.albumProjects.length ? <div className="project-list">{game.albumProjects.map((project) => {
        const projectSongs = game.songs.filter((song) => project.songIds.includes(song.id));
        const currentFocus = project.focusTrackId ?? '';
        const ready = project.status !== 'RELEASED' && project.status !== 'CANCELLED';
        const allReleased = projectSongs.length === project.songIds.length && projectSongs.every((song) => song.status === 'RELEASED');
        const projectStreams = projectSongs.reduce((total, song) => total + song.streams, 0);
        return <article className="album-project" key={project.id}>
          <header><div><span className="music-desk__kicker">{project.status.replace('_', ' ')}</span><h3>{project.title}</h3><p>{project.songIds.length} tracks · quality {project.quality} · budget {money(project.budget)}</p></div><span className="project-badge">{project.status}</span></header>
          <div className="project-tracks">{projectSongs.map((song) => <span key={song.id} className={song.id === currentFocus ? 'is-focus' : ''}>{song.title}{song.id === currentFocus && ' · focus'} · {compact(song.streams)} streams · {projectStreams ? Math.round(song.streams / projectStreams * 100) : 0}% of project</span>)}</div>
          {project.status !== 'CANCELLED' && <div className="project-actions"><label>Focus track<select value={currentFocus} onChange={(event) => focusTrack(project.id, event.target.value)}><option value="">Choose focus track</option>{projectSongs.map((song) => <option key={song.id} value={song.id}>{song.title}</option>)}</select></label>
            {ready && <button type="button" className="desk-button desk-button--primary" onClick={() => releaseProject(project.id)} disabled={!currentFocus || !allReleased || game.money < project.budget}>Release project · {money(project.budget)}</button>}
            {ready && !allReleased && <p>Release every track in the studio before releasing this project.</p>}
            {currentFocus && <button type="button" className="desk-button desk-button--quiet" onClick={() => promoteSong(currentFocus, 'video')}>Promote focus · video</button>}
          </div>}
        </article>;
      })}</div> : <p className="music-desk__empty">No album projects yet. Select existing songs above to start one.</p>}
    </section>
  </section>;
}
