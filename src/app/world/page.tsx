'use client';

import { ArrowLeft, ArrowUpRight, Globe2, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { LagosMapSketch } from '@/components/PhoneScreens';
import { useGame } from '@/lib/game';

const cities = [
  { name: 'Lagos', region: 'WEST AFRICA', scene: 'Warm nights · Afrofusion · Live rooms', color: 'linear-gradient(145deg,#482838,#e48751)' },
  { name: 'London', region: 'UNITED KINGDOM', scene: 'New voices · UK garage · All-night studios', color: 'linear-gradient(145deg,#2e3547,#8a766f)' },
  { name: 'New York', region: 'UNITED STATES', scene: 'Big ambition · Left-field pop · City lights', color: 'linear-gradient(145deg,#282b41,#a16050)' },
  { name: 'Los Angeles', region: 'UNITED STATES', scene: 'Long afternoons · Sessions · Open roads', color: 'linear-gradient(145deg,#574047,#dfa56e)' },
  { name: 'Atlanta', region: 'UNITED STATES', scene: '808s · Southern bounce · New collaborators', color: 'linear-gradient(145deg,#253444,#bd7958)' },
  { name: 'Toronto', region: 'CANADA', scene: 'After hours · Soft edges · R&B', color: 'linear-gradient(145deg,#344452,#b78464)' },
  { name: 'Accra', region: 'GHANA', scene: 'Highlife · Kinship · New energy', color: 'linear-gradient(145deg,#3a3430,#cf8657)' },
  { name: 'Johannesburg', region: 'SOUTH AFRICA', scene: 'Amapiano · Big stages · Open doors', color: 'linear-gradient(145deg,#263d45,#c78851)' },
  { name: 'Paris', region: 'FRANCE', scene: 'Art after dark · Style · New scenes', color: 'linear-gradient(145deg,#453545,#cd8367)' },
  { name: 'Tokyo', region: 'JAPAN', scene: 'Neon nights · New perspective · Precision', color: 'linear-gradient(145deg,#202c43,#c35b66)' },
  { name: 'Seoul', region: 'SOUTH KOREA', scene: 'Bright stages · Sharp sounds · Momentum', color: 'linear-gradient(145deg,#323047,#b67c7c)' },
  { name: 'Dubai', region: 'UAE', scene: 'Big rooms · Wide horizons · Future-facing', color: 'linear-gradient(145deg,#463d42,#d3a16d)' },
];

export default function WorldPage() {
  const game = useGame();
  useEffect(() => { void useGame.persist.rehydrate(); }, []);
  return <main className="world-page"><header className="site-header"><Link href="/" className="site-logo">TREBLR</Link><Link href="/" className="back-link"><ArrowLeft size={13}/> BACK TO YOUR HOME</Link></header>
    <section className="social-main world-local-main">
      <div className="social-title"><div><div className="eyebrow" style={{ color: '#aa7356' }}>A MAP THAT’S HERE ALREADY · 12 SCENES</div><h1>Start with the<br/>streets you know.</h1><p>Tap a stop to walk there now. The local map is drawn in the app—no loading screen, map service, or location access.</p></div><div className="world-you-are"><span className="eyebrow">YOUR SAVE · DAY {game.day}</span><b><MapPin size={15}/> {game.currentLocation}</b><small>{game.currentCity} · {game.time} · ${game.money.toLocaleString()} cash · {game.energy}% energy</small></div></div>
      {game.currentCity === 'Lagos' ? <section className="world-local-map"><div className="world-map-copy"><div className="eyebrow" style={{ color: '#a36f55' }}>YABA → LAGOS ISLAND</div><h2>Four stops, one evening.</h2><p>The Apartment, Teo’s Studio, June Coffee, and Freedom Park Stage are ready from the first tap.</p><div className="world-map-current"><span className="world-current-dot"/><span>YOU’RE AT <b>{game.currentLocation}</b></span></div><small className="world-map-note">Tap a map pin to walk. Cash, energy, and time update in your save.</small></div><div className="world-map-canvas"><LagosMapSketch onWalk={(place) => game.travelLocally(place, 'walk')}/></div></section> : <section className="world-return-card"><div><div className="eyebrow">THE LAGOS NEIGHBORHOOD MAP</div><h2>It’s waiting back home.</h2><p>Local stops are available once you’re in Lagos. Your current room and city travel with this save.</p></div><button className="pill-button orange" disabled={game.money < 420 || game.energy < 15} onClick={() => game.travel('Lagos')}>RETURN TO LAGOS · $420 + 15 ENERGY</button></section>}
      <div className="world-cities-head"><div><div className="eyebrow" style={{ color: '#aa7356' }}>AFTER THE NEIGHBORHOOD</div><h2>Other cities, when you’re ready.</h2></div><span>${game.money.toLocaleString()} cash · {game.energy}% energy</span></div>
      <div className="city-grid world-city-grid">{cities.map((city) => <article className="city-card" key={city.name} style={{ background: city.color }}><div className="eyebrow" style={{ color: '#ffd5a4' }}>{city.region}</div><div><h3>{city.name}{city.name === game.currentCity ? ' · YOU' : ''}</h3><p>{city.scene}</p></div><div className="world-city-action"><span>{city.name === game.currentCity ? 'CURRENT CITY' : 'TICKET · $420 + 15 ENERGY'}</span><button disabled={city.name === game.currentCity || game.money < 420 || game.energy < 15} onClick={() => game.travel(city.name)}>{city.name === game.currentCity ? <><MapPin size={11}/> HERE</> : <><Globe2 size={11}/> GO</>}</button></div></article>)}</div>
      <div className="quote-note world-map-footer"><Sparkles size={14} style={{ verticalAlign: 'middle' }}/> Travel preserves your relationships, songs, offers and local progress. A trip takes cash and energy before it takes you anywhere.</div><Link href="/" className="pill-button" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 22 }}>BACK TO YOUR WORLD <ArrowUpRight size={13}/></Link>
    </section>
  </main>;
}
