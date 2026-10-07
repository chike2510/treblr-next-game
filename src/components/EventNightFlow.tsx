'use client';

import { ArrowRight, Check, Clock3, MapPin, Music2, Ticket, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import { useGame } from '@/lib/game';
import { LAGOS_PLACES, clockMinutes, localRoute, opportunityBlockReason, type LocalTravelMode } from '@/lib/game-rules';

const moods = [
  { id: 'low-key', label: 'Easy', note: 'Keep it close' },
  { id: 'social', label: 'Social', note: 'Bring your people' },
  { id: 'high-energy', label: 'All in', note: 'Make the room move' },
] as const;
const travelModes: { id: LocalTravelMode; name: string; hint: string }[] = [
  { id: 'danfo', name: 'Danfo', hint: 'The shared route' },
  { id: 'ride-hailing', name: 'Car', hint: 'Direct through town' },
  { id: 'walk', name: 'Walk', hint: 'Free, costs energy' },
];
const money = (amount: number) => `$${Math.round(amount).toLocaleString()}`;

export default function EventNightFlow() {
  const game = useGame();
  const plan = game.eventNight;
  const [people, setPeople] = useState<string[]>(plan?.people ?? ['Maya Ellis', 'Teo Park'].filter((name) => game.relationships.some((person) => person.name === name)));
  const [mood, setMood] = useState<(typeof moods)[number]['id']>(plan?.mood ?? 'social');
  const [budget, setBudget] = useState(String(plan?.budget ?? 900));
  const [mode, setMode] = useState<LocalTravelMode>(plan?.ride?.mode ?? 'danfo');
  const [memoryNote, setMemoryNote] = useState('The kick drum met the old stone walls before the lights came up.');

  const event = game.opportunities.find((offer) => offer.id === 'festival');
  const ticket = plan?.ticketId ? game.passes.find((pass) => pass.id === plan.ticketId) : game.passes.find((pass) => pass.eventId === 'festival');
  const memory = ticket ? game.memories.find((record) => record.passId === ticket.id) : undefined;
  const venueId = LAGOS_PLACES.find((place) => place.name === 'Freedom Park Stage')?.id ?? 'venue';
  const originId = LAGOS_PLACES.find((place) => place.name === game.currentLocation)?.id ?? 'apartment';
  const route = localRoute(originId, venueId, mode);
  const planBudget = Math.max(0, Math.floor(Number(budget) || 0));
  const estimatedLocalSpend = (event?.cost ?? ticket?.entryCost ?? 0) + route.fare;
  const exceedsBudget = estimatedLocalSpend > planBudget;
  const eventBlock = event ? opportunityBlockReason(event, game) : 'This live offer is no longer open.';
  const planShared = Boolean(plan);
  const ticketSaved = Boolean(ticket);
  const memorySaved = Boolean(memory);

  const togglePerson = (name: string) => setPeople((current) => current.includes(name) ? current.filter((person) => person !== name) : [...current, name]);
  const savePlan = () => game.shareEventPlan({ people, mood, budget: planBudget });

  return <div className="night-flow">
    <section className="night-hero" aria-label="Lagos Music Festival">
      <div className="night-hero-top"><span className="night-live-tag"><i/> LIVE OFFER · IN THIS STORY</span><span className="night-day">DAY {game.day}</span></div>
      <div className="night-hero-copy"><span className="night-kicker">FREEDOM PARK · LAGOS ISLAND</span><h3>Lagos Music<br/>Festival</h3><p>A golden-hour main-stage set. Bring your people into the night.</p></div>
      <div className="night-hero-meta"><span><Clock3 size={13}/> 4:00–10:00 PM</span><span><MapPin size={13}/> Freedom Park</span></div>
    </section>

    <div className="night-disclaimer">A local game story: plans stay in this save, rides use fixed game fares, and the artist pass is not real admission.</div>

    <ol className="night-steps" aria-label="Event-night progress">
      <li className="is-done"><span>01</span><b>Event</b></li>
      <li className={planShared ? 'is-done' : ''}><span>02</span><b>Plan</b></li>
      <li className={ticketSaved ? 'is-done' : ''}><span>03</span><b>Ride + pass</b></li>
      <li className={memorySaved ? 'is-done' : ''}><span>04</span><b>Memory</b></li>
    </ol>

    <section className="night-section" aria-labelledby="night-plan-title">
      <div className="night-section-head"><span className="night-step-label">02 · YOUR PEOPLE</span><h3 id="night-plan-title">Make it a shared plan.</h3><p>Choose who you want in the plan. It saves here; it doesn’t send real messages.</p></div>
      {plan && (ticketSaved || plan.stage === 'arrived') ? <div className="night-plan-summary"><Users size={17}/><div><b>{plan.people.length ? plan.people.join(' · ') : 'A solo night'}</b><span>{moods.find((item) => item.id === plan.mood)?.label ?? 'Social'} · {money(plan.budget)} planning cap · saved on day {plan.day}</span></div><span className="night-status"><Check size={12}/> SAVED</span></div> : ticketSaved ? <div className="night-plan-summary"><Users size={17}/><div><b>No shared plan saved</b><span>This artist pass came from the existing live-offer flow.</span></div><span className="night-status"><Check size={12}/> PASS SAVED</span></div> : <>
        <div className="night-people-list" role="group" aria-label="Choose people for the plan">
          {game.relationships.map((person) => <button type="button" key={person.name} className={`night-person ${people.includes(person.name) ? 'is-selected' : ''}`} aria-pressed={people.includes(person.name)} onClick={() => togglePerson(person.name)}><span className="night-avatar">{person.avatar}</span><span><b>{person.name}</b><small>{person.role.split('·')[0].trim()}</small></span><i>{people.includes(person.name) ? <Check size={13}/> : '+'}</i></button>)}
        </div>
        <div className="night-form-row">
          <div className="night-field-wrap"><label htmlFor="night-budget">Spending cap · game cash</label><div className="night-budget-input"><span>$</span><input id="night-budget" type="number" min="0" step="50" value={budget} onChange={(event) => setBudget(event.target.value)} inputMode="numeric"/></div></div>
          <div className="night-field-wrap"><span className="night-label">The mood</span><div className="night-moods" role="group" aria-label="Choose the mood for the night">{moods.map((item) => <button type="button" key={item.id} className={mood === item.id ? 'is-selected' : ''} aria-pressed={mood === item.id} onClick={() => setMood(item.id)}>{item.label}</button>)}</div></div>
        </div>
        <div className="night-plan-foot"><span>{people.length ? `${people.length} ${people.length === 1 ? 'person' : 'people'} in the draft` : 'Just you, if that’s the night you want'}</span><button className="btn-primary" type="button" onClick={savePlan} disabled={!event || !Number.isFinite(planBudget)}> {plan ? 'Update shared plan' : 'Save & share in this story'} <ArrowRight size={14}/></button></div>
      </>}
    </section>

    <section className={`night-section ${planShared ? '' : 'is-locked'}`} aria-labelledby="night-ride-title">
      <div className="night-section-head"><span className="night-step-label">03 · GET THERE</span><h3 id="night-ride-title">The route is part of the night.</h3><p>Choose a Lagos route. Fare and travel time are calculated from your saved location.</p></div>
      {!planShared ? <div className="night-locked-note">Save your shared plan first; then the route opens up.</div> : ticketSaved ? <div className="night-arrival-note"><span className="night-arrival-icon"><Check size={17}/></span><div><b>You made it to Freedom Park.</b><span>{plan?.ride ? `${plan.ride.mode === 'ride-hailing' ? 'Car' : plan.ride.mode} · ${plan.ride.minutes} min · ${money(plan.ride.fare)} · arrived ${plan.ride.arrivalTime}` : `The show is in your story · ${ticket?.time}`}</span></div></div> : plan?.stage === 'arrived' ? <div className="night-arrival-note"><span className="night-arrival-icon"><Check size={17}/></span><div><b>You’re at Freedom Park.</b><span>{plan.ride ? `${plan.ride.mode === 'ride-hailing' ? 'Car' : plan.ride.mode} · ${plan.ride.minutes} min · ${money(plan.ride.fare)} · arrived ${plan.ride.arrivalTime}` : 'Your plan is saved at the venue.'}</span></div></div> : game.currentCity !== 'Lagos' ? <div className="night-return-card"><b>Back to Lagos first.</b><span>The festival and its local routes are in your Lagos save.</span><button className="btn-primary" type="button" disabled={game.money < 420 || game.energy < 15} onClick={() => game.travel('Lagos')}>Return to Lagos · $420 + 15 energy</button></div> : <>
        <div className="night-route-options" role="group" aria-label="Choose transport to the festival">{travelModes.map((item) => { const quote = localRoute(originId, venueId, item.id); return <button type="button" key={item.id} className={mode === item.id ? 'is-selected' : ''} aria-pressed={mode === item.id} onClick={() => setMode(item.id)}><span className="night-route-check">{mode === item.id ? <Check size={12}/> : null}</span><b>{item.name}</b><small>{item.hint}</small><strong>{item.id === 'walk' ? `${quote.minutes} min · ${quote.energy} energy` : `${quote.minutes} min · ${money(quote.fare)}`}</strong></button>; })}</div>
        <div className="night-total-line"><span><Wallet size={14}/> Est. in-game spend <small>show cost + chosen local fare</small></span><b>{money(estimatedLocalSpend)}</b></div>
        {exceedsBudget && <p className="night-budget-warning">That route is above your spending cap. Raise the cap or choose another way there.</p>}
        <button className="btn-primary night-wide-action" type="button" disabled={Boolean(!event || eventBlock && eventBlock.includes('expired') || exceedsBudget || route.minutes === 0 || game.currentCity !== 'Lagos' || (mode === 'walk' ? game.energy < route.energy : game.money < route.fare) || (venueId !== originId && clockMinutes(game.time) + route.minutes > clockMinutes('10:30 PM')))} onClick={() => game.travelLocally(venueId, mode)}>{route.minutes === 0 ? 'You are at the venue' : `Go by ${mode === 'ride-hailing' ? 'car' : mode} · ${money(route.fare)} · ${route.minutes} min`} <ArrowRight size={14}/></button>
      </>}
    </section>

    <section className={`night-section ${plan?.stage === 'arrived' && !ticketSaved ? '' : 'is-locked'}`} aria-labelledby="night-pass-title">
      <div className="night-section-head"><span className="night-step-label">03 · THE SET</span><h3 id="night-pass-title">Take the stage.</h3><p>This is the existing live opportunity, with its game costs and modeled outcomes shown before you commit.</p></div>
      {ticketSaved ? <article className="night-pass-card"><div className="night-pass-stamp"><Ticket size={21}/><span>STORY<br/>PASS</span></div><div><span className="night-step-label">SAVED IN YOUR GAME</span><b>{ticket?.passType} · Lagos Music Festival</b><small>{ticket ? `Day ${ticket.day} · ${ticket.time} · ${ticket.venue}` : ''}</small><small>No QR code or real venue admission.</small></div><span className="night-pass-mark"><Check size={14}/></span></article> : plan?.stage === 'arrived' ? <>
        <div className="night-outcomes"><span><small>GAME COST</small><b>−{money(event?.cost ?? 0)}</b></span><span><small>MODELED PAY</small><b>+{money(event?.effects.cash ?? 0)}</b></span><span><small>ENERGY</small><b>{event?.effects.energy ?? 0}</b></span></div>
        <p className="night-outcome-note">Audience and reputation changes are simulated in this story, not real-world counts.</p>
        <button className="btn-primary night-wide-action" type="button" disabled={!event || Boolean(eventBlock)} onClick={() => event && game.acceptOpportunity(event.id)}>{eventBlock ? eventBlock : 'Perform your set · confirm in-game'} <ArrowRight size={14}/></button>
      </> : <div className="night-locked-note">After the route, this is where you confirm the live set. Nothing is booked or paid outside the game.</div>}
    </section>

    <section className={`night-section ${ticketSaved ? '' : 'is-locked'}`} aria-labelledby="night-memory-title">
      <div className="night-section-head"><span className="night-step-label">04 · KEEP THE NIGHT</span><h3 id="night-memory-title">Leave yourself a record.</h3><p>One detail is enough to bring the room back later.</p></div>
      {memorySaved && memory ? <article className="night-memory-card"><div className="night-memory-meta"><span><Music2 size={13}/> MEMORY · DAY {memory.day}</span><span>{memory.location}</span></div><h4>{memory.title}</h4><p>“{memory.note}”</p><div className="night-memory-people"><Users size={13}/>{memory.people.length ? memory.people.join(' · ') : 'A night of your own'}</div></article> : ticketSaved ? <><label className="night-memory-label" htmlFor="night-memory-note">What do you want to remember?</label><textarea id="night-memory-note" className="night-memory-input" maxLength={500} value={memoryNote} onChange={(event) => setMemoryNote(event.target.value)}/><div className="night-memory-submit"><span>{memoryNote.trim().length}/500</span><button type="button" className="btn-primary" disabled={!memoryNote.trim()} onClick={() => game.saveEventMemory(memoryNote)}>Save this memory <ArrowRight size={14}/></button></div></> : <div className="night-locked-note">Your record unlocks after the set. It will stay with this game save.</div>}
    </section>

    <footer className="night-footer"><Check size={13}/> Your plan, local route, artist pass, and memory stay together in this saved story. No bookings, ride service, or external messages are sent.</footer>
  </div>;
}
