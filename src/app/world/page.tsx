'use client';

import { ArrowLeft, ArrowUpRight, Globe2, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { LagosMapSketch } from '@/components/PhoneScreens';
import { useGame } from '@/lib/game';
import { CITIES, TRAVEL_CASH, TRAVEL_ENERGY } from '@/lib/cities';


export default function WorldPage() {
  const game = useGame();
  useEffect(() => { void useGame.persist.rehydrate(); }, []);
  return <main className="world-page"><header className="site-header"><Link href="/" className="site-logo">TREBLR</Link><Link href="/" className="back-link"><ArrowLeft size={13}/> BACK TO YOUR HOME</Link></header>
    <section className="social-main world-local-main">
      <div className="social-title"><div><div className="eyebrow" style={{ color: '#aa7356' }}>12 CITIES</div><h1>Start with the<br/>streets you know.</h1><p>Tap a stop to walk there now.</p></div><div className="world-you-are"><span className="eyebrow">YOUR SAVE · DAY {game.day}</span><b><MapPin size={15}/> {game.currentLocation}</b><small>{game.currentCity} · {game.time} · ${game.money.toLocaleString()} cash · {game.energy}% energy</small></div></div>
      {game.currentCity === 'Lagos' ? <section className="world-local-map"><div className="world-map-copy"><div className="eyebrow" style={{ color: '#a36f55' }}>YABA → LAGOS ISLAND</div><h2>Four stops, one evening.</h2><p>The Apartment, Teo’s Studio, June Coffee, and Freedom Park Stage are ready from the first tap.</p><div className="world-map-current"><span className="world-current-dot"/><span>YOU’RE AT <b>{game.currentLocation}</b></span></div><small className="world-map-note">Tap a pin to walk.</small></div><div className="world-map-canvas"><LagosMapSketch onWalk={(place) => game.travelLocally(place, 'walk')}/></div></section> : <section className="world-return-card"><div><div className="eyebrow">THE LAGOS NEIGHBORHOOD MAP</div><h2>It’s waiting back home.</h2><p>Local stops open once you’re back in Lagos.</p></div><button className="pill-button orange" disabled={game.money < 420 || game.energy < 15} onClick={() => game.travel('Lagos')}>Fly home · $420 · 15 energy</button></section>}
      <div className="world-cities-head"><div><div className="eyebrow" style={{ color: '#aa7356' }}>AFTER THE NEIGHBORHOOD</div><h2>Other cities, when you’re ready.</h2></div><span>${game.money.toLocaleString()} cash · {game.energy}% energy</span></div>
      <div className="city-grid world-city-grid">{CITIES.map((city) => { const here = city.name === game.currentCity; return <article className={`postcard-card${here ? ' is-here' : ''}`} key={city.name} style={{ backgroundImage: `url(${city.image})` }}><span className="postcard-code mono">{city.code} · {city.region}</span><h3 className="postcard-name">{city.name}</h3><p>{city.scene}</p><div className="world-city-action"><span className="mono">{here ? 'You’re here' : `$${TRAVEL_CASH} · ${TRAVEL_ENERGY} energy`}</span><button type="button" className={here ? 'btn-secondary' : 'btn-primary'} disabled={here || game.money < TRAVEL_CASH || game.energy < TRAVEL_ENERGY} onClick={() => game.travel(city.name)}>{here ? <><MapPin size={13}/> Here</> : <><Globe2 size={13}/> Fly</>}</button></div></article>; })}</div>
      <div className="quote-note world-map-footer"><Sparkles size={14} style={{ verticalAlign: 'middle' }}/> Your people, songs and offers travel with you.</div><Link href="/" className="pill-button" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 22 }}>Back home <ArrowUpRight size={13}/></Link>
    </section>
  </main>;
}
