'use client';

import { ArrowLeft, ArrowUpRight, Globe2, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useGame } from '@/lib/game';

const cities = [
  { name: 'Lagos', region: 'WEST AFRICA', scene: 'Warm nights · Afrofusion · Live rooms', stat: 'YOUR HOME', color: 'linear-gradient(145deg,#482838,#e48751)' },
  { name: 'London', region: 'UNITED KINGDOM', scene: 'New voices · UK garage · All-night studios', stat: 'LATE SESSIONS', color: 'linear-gradient(145deg,#2e3547,#8a766f)' },
  { name: 'New York', region: 'UNITED STATES', scene: 'Big ambition · Left-field pop · City lights', stat: 'LOUD IDEAS', color: 'linear-gradient(145deg,#282b41,#a16050)' },
  { name: 'Los Angeles', region: 'UNITED STATES', scene: 'Long afternoons · Sessions · Open roads', stat: 'BLUE SKIES', color: 'linear-gradient(145deg,#574047,#dfa56e)' },
  { name: 'Atlanta', region: 'UNITED STATES', scene: '808s · Southern bounce · New collaborators', stat: 'FRESH HEAT', color: 'linear-gradient(145deg,#253444,#bd7958)' },
  { name: 'Toronto', region: 'CANADA', scene: 'After hours · Soft edges · R&B', stat: 'COLD CITY / WARM SOUND', color: 'linear-gradient(145deg,#344452,#b78464)' },
  { name: 'Accra', region: 'GHANA', scene: 'Highlife · Kinship · New energy', stat: 'CLOSE TO HOME', color: 'linear-gradient(145deg,#3a3430,#cf8657)' },
  { name: 'Johannesburg', region: 'SOUTH AFRICA', scene: 'Amapiano · Big stages · Open doors', stat: 'FESTIVAL SEASON', color: 'linear-gradient(145deg,#263d45,#c78851)' },
  { name: 'Paris', region: 'FRANCE', scene: 'Art after dark · Style · New scenes', stat: 'THE LEFT BANK', color: 'linear-gradient(145deg,#453545,#cd8367)' },
  { name: 'Tokyo', region: 'JAPAN', scene: 'Neon nights · New perspective · Precision', stat: 'AFTER HOURS', color: 'linear-gradient(145deg,#202c43,#c35b66)' },
  { name: 'Seoul', region: 'SOUTH KOREA', scene: 'Bright stages · Sharp sounds · Momentum', stat: 'NEW FREQUENCY', color: 'linear-gradient(145deg,#323047,#b67c7c)' },
  { name: 'Dubai', region: 'UAE', scene: 'Big rooms · Wide horizons · Future-facing', stat: 'NEXT CHAPTER', color: 'linear-gradient(145deg,#463d42,#d3a16d)' },
];

export default function WorldPage() {
  const game = useGame();
  useEffect(() => { void useGame.persist.rehydrate(); }, []);
  return <main className="world-page"><header className="site-header"><Link href="/" className="site-logo">TREBLR</Link><Link href="/" className="back-link"><ArrowLeft size={13}/> BACK TO YOUR HOME</Link></header><section className="social-main"><div className="social-title"><div><div className="eyebrow" style={{ color: '#aa7356' }}>WORLD MAP · 12 SCENES</div><h1>There’s more<br/>than one way in.</h1><p>You started in Lagos. That’s part of your story—not a limit on where the music can go. A ticket costs $420 and a little bit of energy.</p></div><div className="map-strip" style={{ width: 310, height: 180, flex: '0 0 310px' }}><div className="map-pin p1"/><div className="map-pin p2"/><div className="map-pin p3"/><div className="map-label">{game.currentCity.toUpperCase()} · YOU ARE HERE</div></div></div><div className="city-grid world-city-grid">{cities.map((city) => <article className="city-card" key={city.name} style={{ background: city.color }}><div className="eyebrow" style={{ color: '#ffd5a4' }}>{city.region}</div><div><h3>{city.name}{city.name === game.currentCity ? ' · YOU' : ''}</h3><p>{city.scene}</p></div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ font: '600 8px var(--display)', letterSpacing: '.12em', opacity: .72 }}>{city.stat}</span><button disabled={city.name === game.currentCity} onClick={() => game.travel(city.name)}>{city.name === game.currentCity ? <><MapPin size={11}/> HERE</> : <><Globe2 size={11}/> GO · $420</>}</button></div></article>)}</div><div className="quote-note" style={{ marginTop: 20 }}><Sparkles size={14} style={{ verticalAlign: 'middle' }}/> Each city changes your surroundings and opens fresh people, opportunities, and scenes. Your save stays with you when you travel.</div><Link href="/" className="pill-button" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 22 }}>BACK TO YOUR APARTMENT <ArrowUpRight size={13}/></Link></section></main>;
}
