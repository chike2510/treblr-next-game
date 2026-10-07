'use client';

import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, Clock3, Heart, MapPin, MessageCircle, Music2, ShoppingBag, Sparkles, Star, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '@/lib/game';
import { BOUTIQUE_ITEMS, LAGOS_PLACES, clockMinutes, localRoute, opportunityBlockReason, type LagosPlaceId, type LocalTravelMode, type Opportunity } from '@/lib/game-rules';

export type PhoneScreen = 'map' | 'rides' | 'calendar' | 'shows' | 'label' | 'boutique' | 'team' | 'home' | 'lock' | 'messages' | 'social' | 'bank';
type Props = { screen: PhoneScreen; back: () => void; setScreen: (screen: PhoneScreen) => void; onPanel: (panel: string) => void };
const money = (value: number) => `$${Math.round(value).toLocaleString()}`;
const short = (value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : `${Math.round(value / 1000)}K`;
const localOrigin = (currentLocation: string): LagosPlaceId => LAGOS_PLACES.find((place) => place.name === currentLocation)?.id ?? 'apartment';
const formatReward = (offer: Opportunity) => [offer.effects.cash ? `${offer.effects.cash > 0 ? '+' : '−'}${money(Math.abs(offer.effects.cash))}` : '', offer.effects.fans ? `+${short(offer.effects.fans)} fans` : '', offer.effects.reputation ? `${offer.effects.reputation > 0 ? '+' : ''}${offer.effects.reputation} rep` : ''].filter(Boolean).join(' · ');

function Header({ title, back, detail }: { title: string; back: () => void; detail?: string }) {
  return <div className="ps-head"><button className="ps-back" onClick={back} aria-label="Back to phone"><ArrowLeft size={15}/></button><div><div className="ps-kicker">CANDELAR · {detail ?? 'LAGOS, NIGERIA'}</div><h3>{title}</h3></div><span className="ps-signal">● ◒ ▰</span></div>;
}

export function LagosMapSketch({ onWalk }: { onWalk: (place: LagosPlaceId) => void }) {
  const game = useGame();
  const origin = localOrigin(game.currentLocation);
  return <>
    <div className="ps-map" aria-label="A locally rendered sketch map of Yaba and Lagos Island">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="ps-map-water" d="M67 67 C76 64 82 69 89 67 L100 73 L100 100 L65 100 C71 91 70 81 67 67Z"/>
        <path className="ps-map-road ps-road-main" d="M5 79 C20 64 28 56 42 48 S61 34 77 26 S90 19 99 8"/>
        <path className="ps-map-road" d="M4 26 C20 33 24 45 35 60 S50 79 56 98"/>
        <path className="ps-map-road" d="M12 3 C21 20 32 25 46 32 S68 45 93 47"/>
        <path className="ps-map-road" d="M5 50 C22 47 27 43 40 36 S68 21 91 22"/>
        <path className="ps-map-route" d="M21 63 Q34 39 46 31 T72 52 Q79 69 84 82"/>
        <path className="ps-map-route" d="M21 63 Q46 55 72 52 T84 82"/>
      </svg>
      <span className="ps-map-water-label">LAGOS LAGOON</span>
      <span className="ps-map-neighbourhood ps-map-yaba">YABA</span>
      <span className="ps-map-neighbourhood ps-map-island">LAGOS ISLAND</span>
      {LAGOS_PLACES.map((place) => {
        const here = place.id === origin;
        const route = localRoute(origin, place.id, 'walk');
        const blocked = game.energy < route.energy;
        return <button key={place.id} className={`ps-map-pin ${here ? 'is-here' : ''}`} style={{ left: `${place.x}%`, top: `${place.y}%` }} onClick={() => onWalk(place.id)} disabled={here || blocked} aria-label={here ? `${place.name}, you are here` : `Walk to ${place.name}, ${route.minutes} minutes and ${route.energy} energy`}>
          <i/><span>{place.name}{here ? ' · YOU' : ''}</span>
        </button>;
      })}
    </div>
    <div className="ps-map-caption"><span><i/> YOU ARE HERE</span><span>YABA → LAGOS ISLAND</span></div>
  </>;
}

function MapScreen({ back, setScreen }: Props) {
  const game = useGame();
  const origin = localOrigin(game.currentLocation);
  return <><Header title="Around Lagos" back={back} detail={`${game.currentCity.toUpperCase()} · DAY ${game.day}`}/>
    {game.currentCity === 'Lagos' ? <>
      <LagosMapSketch onWalk={(id) => game.travelLocally(id, 'walk')}/>
      <div className="ps-location-heading"><div><span className="ps-kicker">RIGHT NOW</span><strong>{game.currentLocation}</strong></div><button className="ps-text-link" onClick={() => setScreen('rides')}>Need a ride? <ArrowRight size={13}/></button></div>
      <div className="ps-place-list">{LAGOS_PLACES.filter((place) => place.id !== origin).map((place) => { const route = localRoute(origin, place.id, 'walk'); return <button key={place.id} className="ps-place-row" onClick={() => game.travelLocally(place.id, 'walk')} disabled={game.energy < route.energy}><span className="ps-place-mark"><MapPin size={15}/></span><span className="ps-place-copy"><b>{place.name}</b><small>{place.area}</small></span><span className="ps-place-cost">{route.minutes} min<br/><small>−{route.energy} energy</small></span><ChevronRight size={14}/></button>; })}</div>
      <div className="ps-footnote">Walking is free. It costs the energy shown.</div><button className="ps-secondary ps-wide" onClick={() => window.location.assign('/world')}>EXPLORE THE OTHER CITIES <ArrowRight size={13}/></button>
    </> : <div className="ps-empty-map"><MapPin size={23}/><span className="ps-kicker">LOCAL STOPS ARE IN LAGOS</span><p>{game.currentLocation} is your current base in {game.currentCity}. The Yaba-to-Island sketch map is ready when you return.</p><button className="ps-primary" onClick={() => game.travel('Lagos')}>TRAVEL TO LAGOS · $420 + 15 ENERGY</button><button className="ps-secondary" onClick={() => window.location.assign('/world')}>SEE OTHER CITIES</button></div>}
  </>;
}

function RidesScreen({ back }: Props) {
  const game = useGame();
  const [mode, setMode] = useState<LocalTravelMode>('danfo');
  const origin = localOrigin(game.currentLocation);
  if (game.currentCity !== 'Lagos') return <><Header title="Rides" back={back}/><div className="ps-empty-map"><span className="ps-kicker">RIDES</span><p>Rides run in Lagos for now. Fly home to get around.</p><button className="ps-primary" onClick={() => game.travel('Lagos')}>TRAVEL TO LAGOS · $420 + 15 ENERGY</button></div></>;
  return <><Header title="Rides" back={back} detail={`${game.currentLocation.toUpperCase()} · ${game.time}`}/>
    <div className="ps-wallet-strip"><Wallet size={15}/><span>Cash in hand</span><b>{money(game.money)}</b><i>·</i><span>{game.energy}% energy</span></div>
    <div className="ps-mode-tabs" role="group" aria-label="Choose a way to travel">{(['danfo', 'ride-hailing', 'walk'] as const).map((item) => <button key={item} className={mode === item ? 'selected' : ''} onClick={() => setMode(item)}>{item === 'danfo' ? 'Danfo' : item === 'walk' ? 'Walk' : 'Car'}</button>)}</div>
    <p className="ps-section-note">From <b>{game.currentLocation}</b> · fares and journey time are part of this save.</p>
    <div className="ps-place-list">{LAGOS_PLACES.filter((place) => place.id !== origin).map((place) => { const route = localRoute(origin, place.id, mode); const late = place.id !== 'apartment' && clockMinutes(game.time) + route.minutes > clockMinutes('10:30 PM'); const blocked = mode === 'walk' ? game.energy < route.energy : game.money < route.fare; return <article className="ps-ride-card" key={place.id}><div className="ps-ride-route"><span className="ps-ride-dot"/><span className="ps-ride-line"/><span className="ps-ride-dot destination"/></div><div className="ps-ride-copy"><span className="ps-kicker">{place.area.toUpperCase()}</span><b>{place.name}</b><small>{mode === 'walk' ? `About ${route.minutes} min · ${route.energy} energy` : `${route.minutes} min · ${money(route.fare)}`}</small></div><button className="ps-ride-go" onClick={() => game.travelLocally(place.id, mode)} disabled={blocked || late || route.minutes === 0}>{blocked ? mode === 'walk' ? 'REST' : 'LOW CASH' : late ? 'TOO LATE' : 'GO'} <ChevronRight size={13}/></button></article>; })}</div>
    <div className="ps-footnote">Danfo fares and car fares are fixed game costs, not live ride quotes. No ride service is contacted.</div>
  </>;
}

function offerScreen(id: string) { return id === 'festival' ? 'shows' : id === 'label' || id === 'campaign' ? 'label' : id === 'collab' ? 'team' : 'shows'; }
function CalendarScreen({ back, setScreen, onPanel }: Props) {
  const game = useGame();
  const entries = [
    ...game.songs.filter((song) => song.status === 'SCHEDULED' && song.releaseDay !== undefined).map((song) => ({ day: song.releaseDay!, kind: 'release' as const, id: song.id, title: song.title, detail: `${song.genre} · release plan saved`, action: 'OPEN STUDIO' })),
    ...game.opportunities.map((offer) => ({ day: offer.expiresOnDay, kind: 'offer' as const, id: offer.id, title: offer.title, detail: `${offer.type} · ${offer.city ?? 'Lagos'}${offer.location ? ` · ${offer.location}` : ''}`, action: 'VIEW' })),
  ].sort((a, b) => a.day - b.day);
  return <><Header title="Calendar" back={back} detail={`DAY ${game.day} · ${game.time}`}/>
    <div className="ps-calendar-today"><span className="ps-kicker">TODAY IN {game.currentCity.toUpperCase()}</span><div><Clock3 size={18}/><b>{game.time}</b></div><p>Offers expire on the day shown. A release date is the one you chose in the studio.</p></div>
    <div className="ps-calendar-head"><span className="ps-kicker">WHAT’S ACTUALLY ON THE BOOKS</span><b>{entries.length ? `${entries.length} saved ${entries.length === 1 ? 'item' : 'items'}` : 'A little breathing room'}</b></div>
    {entries.length ? <div className="ps-timeline">{entries.map((item) => <article className="ps-event-row" key={`${item.kind}-${item.id}`}><div className="ps-day-badge"><small>DAY</small><b>{item.day}</b></div><div className="ps-event-copy"><span className="ps-kicker">{item.kind === 'release' ? 'RELEASE DATE' : 'OFFER DEADLINE'}</span><b>{item.title}</b><small>{item.detail}</small></div><button className="ps-text-link" onClick={() => item.kind === 'release' ? onPanel('studio') : setScreen(offerScreen(item.id))}>{item.action}<ChevronRight size={13}/></button></article>)}</div> : <div className="ps-empty-card"><CalendarDays size={20}/><p>No release date or open offer is saved on your calendar yet.</p><button className="ps-secondary" onClick={() => setScreen('shows')}>CHECK SHOWS & OFFERS</button></div>}
    <div className="ps-footnote">This calendar reads your saved offers and scheduled songs; it doesn’t invent bookings.</div>
  </>;
}

function ShowsScreen({ back, setScreen, onPanel }: Props) {
  const game = useGame();
  const offers = game.opportunities.filter((offer) => offer.type.includes('LIVE'));
  return <><Header title="Shows" back={back} detail={`${game.currentCity.toUpperCase()} · ${game.time}`}/>
    <div className="ps-show-hero"><div className="ps-kicker">LIVE WORK · IN-GAME ONLY</div><div className="ps-show-mark"><Star size={17}/><span>THE<br/>ROOM</span></div><h4>Make the room yours.</h4><p>Only the offers on your save appear here. Travel, time, cash, and energy still count.</p></div>
    {offers.length ? offers.map((offer) => { const blocked = opportunityBlockReason(offer, game); const isFestival = offer.id === 'festival'; return <article className="ps-offer-card" key={offer.id}><div className="ps-offer-top"><span className="ps-kicker">{offer.type}</span><span className="ps-deadline">THROUGH DAY {offer.expiresOnDay}</span></div><h4>{offer.title}</h4><p>{offer.detail}</p><div className="ps-offer-terms"><span>SET COST <b>{money(offer.cost)}</b></span><span>REWARD <b>{formatReward(offer) || 'See offer'}</b></span><span>ENERGY <b>{offer.effects.energy > 0 ? '+' : ''}{offer.effects.energy}</b></span></div>{blocked && !isFestival && (blocked.includes('Freedom Park') || blocked.includes('Travel to')) && <button className="ps-secondary ps-wide" onClick={() => setScreen('map')}>OPEN THE LAGOS MAP · FIND THE STAGE</button>}<button className="ps-primary" disabled={!isFestival && Boolean(blocked)} onClick={() => isFestival ? onPanel('event-night') : game.acceptOpportunity(offer.id)}>{isFestival ? 'PLAN A SHARED NIGHT' : blocked ? blocked.toUpperCase() : 'ACCEPT THIS SHOW'}</button>{blocked && <small className="ps-block-reason">{isFestival ? 'Plan the route first; time, venue, and cash are checked before the set.' : blocked}</small>}</article>; }) : <div className="ps-empty-card"><Music2 size={20}/><p>No offers right now. New ones land here.</p></div>}
    {game.passes.slice(0, 3).map((pass) => { const memory = game.memories.find((item) => item.passId === pass.id); return <article className="ps-offer-card ps-saved-night" key={pass.id}><div className="ps-offer-top"><span className="ps-kicker">STORY PASS · DAY {pass.day}</span><span className="ps-deadline">GAME SAVE ONLY</span></div><h4>{pass.eventTitle}</h4><p>{memory ? `“${memory.note}”` : 'Your artist pass is saved. Add a memory to complete the night.'}</p><button className="ps-primary" onClick={() => onPanel('event-night')}>{memory ? 'REOPEN THIS NIGHT' : 'FINISH THIS NIGHT'}</button><small className="ps-block-reason">Not a real ticket; no QR code or venue admission.</small></article>; })}
    <div className="ps-footnote">Shows change this game’s cash, energy, audience, and history. Nothing is posted to a real account.</div>
  </>;
}

function LabelScreen({ back }: Props) {
  const game = useGame();
  const offers = game.opportunities.filter((offer) => offer.id === 'label' || offer.id === 'campaign');
  const signed = game.history.find((entry) => entry.title.includes('Accepted · Aster House Records'));
  return <><Header title="Label desk" back={back} detail="PRIVATE · LOCAL STORY"/>
    <div className="ps-label-letter"><div className="ps-label-monogram">AH</div><div className="ps-kicker">ASTER HOUSE RECORDS · LAGOS / LONDON</div><h4>A note worth reading<br/>before you answer.</h4><p>Labels are conversations, not a shortcut. The catalogue, reputation, and the offer deadline are checked against your save.</p></div>
    {offers.length ? offers.map((offer) => { const blocked = opportunityBlockReason(offer, game); return <article className="ps-offer-card ps-label-offer" key={offer.id}><div className="ps-offer-top"><span className="ps-kicker">{offer.type}</span><span className="ps-deadline">DAY {offer.expiresOnDay}</span></div><h4>{offer.title}</h4><p>{offer.detail}</p><div className="ps-offer-terms"><span>ADVANCE / FEE <b>{offer.cost ? money(offer.cost) : 'None'}</b></span><span>ON ACCEPTANCE <b>{formatReward(offer) || 'Terms saved in game'}</b></span></div><div className="ps-requirements">{blocked ? <><span className="ps-lock-dot"/> {blocked}</> : <><Check size={13}/> Requirements met · you can decide now.</>}</div><button className="ps-primary" disabled={Boolean(blocked)} onClick={() => game.acceptOpportunity(offer.id)}>{blocked ? 'NOT READY YET' : 'ACCEPT THE CONVERSATION'}</button></article>; }) : signed ? <div className="ps-empty-card ps-signed-note"><Check size={21}/><span className="ps-kicker">YOUR STORY · DAY {signed.day}</span><p>{signed.detail}</p></div> : <div className="ps-empty-card"><Music2 size={20}/><p>No label offer is open in your save. Your songs and reputation are still building.</p></div>}
  </>;
}

function BoutiqueScreen({ back }: Props) {
  const game = useGame();
  return <><Header title="Boutique" back={back} detail="SMALL DETAILS · YOURS TO KEEP"/>
    <div className="ps-boutique-note"><span className="ps-kicker">TONIGHT’S EDIT</span><h4>Wear the next<br/>chapter in.</h4><p>One good piece. Bought with the same cash the rides use.</p><div className="ps-wallet-strip"><Wallet size={14}/><span>Cash in hand</span><b>{money(game.money)}</b></div></div>
    <div className="ps-item-list">{BOUTIQUE_ITEMS.map((item, index) => { const owned = game.wardrobe.includes(item.id); return <article className="ps-item-card" key={item.id}><div className={`ps-item-art ps-item-art-${index}`}><span>{index === 0 ? 'LN' : index === 1 ? 'ST' : 'FP'}</span></div><div className="ps-item-copy"><span className="ps-kicker">{owned && game.equippedLook === item.id ? 'ON TONIGHT' : owned ? 'IN YOUR WARDROBE' : 'YABA · SMALL RUN'}</span><b>{item.name}</b><small>{item.note}</small><strong>{money(item.price)}</strong><button className={owned ? 'ps-secondary' : 'ps-primary'} disabled={owned || game.money < item.price} onClick={() => game.buyBoutiqueItem(item.id)}>{owned ? 'IN THE WARDROBE' : game.money < item.price ? 'SAVE A LITTLE MORE' : 'BUY & WEAR'}</button></div></article>; })}</div>
    <div className="ps-footnote">Owned pieces are saved in your wardrobe. Buying one spends cash and nudges mood; no outside shop or payment is involved.</div>
  </>;
}

function TeamScreen({ back, onPanel }: Props) {
  const game = useGame();
  return <><Header title="The people" back={back} detail={`${game.relationships.length} OPEN THREADS`}/>
    <div className="ps-team-intro"><div className="ps-kicker">THE PEOPLE WHO HEAR IT FIRST</div><p>Good work takes more than a room. Reply, make a promise, or protect your evening.</p><div className="ps-wallet-strip"><Heart size={14}/><span>Energy</span><b>{game.energy}%</b><i>·</i><span>Cash</span><b>{money(game.money)}</b></div></div>
    <div className="ps-team-list">{game.relationships.map((person) => <article className="ps-person-card" key={person.name}><div className="ps-person-head"><span className="ps-person-avatar">{person.avatar}</span><div><span className="ps-kicker">{person.role.toUpperCase()}</span><b>{person.name}</b></div><span className="ps-trust">{person.trust}<small>TRUST</small></span></div><p className="ps-message-quote">“{person.note}”</p><div className="ps-person-actions"><button onClick={() => game.messagePerson(person.name, 'reply')}><MessageCircle size={13}/> Reply · free</button><button disabled={game.energy < 8} onClick={() => game.messagePerson(person.name, 'help')}><Sparkles size={13}/> Show up · 8 energy</button><button disabled={game.money < 210 || game.energy < 12 || person.name === 'Teo Park' && game.currentCity !== 'Lagos'} onClick={() => game.messagePerson(person.name, 'accept-session')}><Music2 size={13}/> Book session · $210</button><button className="ps-pass" onClick={() => game.messagePerson(person.name, 'decline')}>Pass kindly</button></div></article>)}</div>
    {!game.relationships.length && <div className="ps-empty-card"><Users size={20}/><p>There isn’t an open conversation in your save yet.</p></div>}
    <button className="ps-secondary ps-wide" onClick={() => onPanel('history')}>READ THE STORY SO FAR <ChevronRight size={13}/></button>
    <div className="ps-footnote">Replies and promises update each person’s saved note and trust. Session costs and energy are checked before you commit.</div>
  </>;
}

export default function PhoneDestinationScreen(props: Props) {
  const { screen } = props;
  if (screen === 'map') return <MapScreen {...props}/>;
  if (screen === 'rides') return <RidesScreen {...props}/>;
  if (screen === 'calendar') return <CalendarScreen {...props}/>;
  if (screen === 'shows') return <ShowsScreen {...props}/>;
  if (screen === 'label') return <LabelScreen {...props}/>;
  if (screen === 'boutique') return <BoutiqueScreen {...props}/>;
  if (screen === 'team') return <TeamScreen {...props}/>;
  return null;
}
