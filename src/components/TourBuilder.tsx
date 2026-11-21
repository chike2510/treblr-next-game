'use client';

import { useMemo, useState } from 'react';
import { useGame } from '@/lib/game';
import { estimateTour, money, resolveTour, TOUR_VENUES, TOUR_CITIES, tourEnergyCost, useTourStore, validateTourInput, type TourVenue } from '@/lib/tour';
import '@/styles/tour.css';

const cityDemandOf = (game: { currentCity: string; cityDemand?: Record<string, number> }, city = game.currentCity) => {
  return Math.min(100, 50 + (game.cityDemand?.[city] ?? 0));
};

export default function TourBuilder() {
  const game = useGame();
  const tour = useTourStore();
  const released = game.songs.filter((song) => song.status === 'RELEASED');
  const [city, setCity] = useState(game.currentCity);
  const [venueId, setVenueId] = useState(TOUR_VENUES.find((venue) => venue.city === game.currentCity)?.id ?? TOUR_VENUES[0].id);
  const [selected, setSelected] = useState<string[]>(released.slice(0, 3).map((song) => song.id));
  const [price, setPrice] = useState(25);
  const [setlistName, setSetlistName] = useState('');
  const [message, setMessage] = useState('');

  const venue = TOUR_VENUES.find((item) => item.id === venueId) ?? TOUR_VENUES[0];
  const selectedSongs = released.filter((song) => selected.includes(song.id));
  const estimate = useMemo(() => estimateTour({ songs: selectedSongs, city, venue, ticketPrice: price, fans: game.fans, currentCity: game.currentCity, cityDemand: cityDemandOf(game, city), performance: game.skills.PERFORMANCE }), [selectedSongs, city, venue, price, game.fans, game.currentCity, game.cityDemand, game.skills.PERFORMANCE]);
  const energyCost = tourEnergyCost(venue);
  const activeBooking = tour.bookings.find((booking) => booking.status === 'booked');

  const changeCity = (nextCity: string) => {
    setCity(nextCity);
    const nextVenue = TOUR_VENUES.find((item) => item.city === nextCity);
    if (nextVenue) setVenueId(nextVenue.id);
  };
  const toggleSong = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(0, 12));
  const saveSetlist = () => {
    const id = tour.saveSetlist(setlistName || `${game.artist.name} · ${city} set`, selected);
    setMessage(id ? 'Setlist saved. You can reuse it for another room.' : 'Name the setlist and choose at least one released song.');
    if (id) setSetlistName('');
  };
  const bookShow = () => {
    const error = validateTourInput({ songs: selectedSongs, city, venue, ticketPrice: price, energy: game.energy, money: game.money });
    if (error) { setMessage(error); return; }
    if (tour.bookings.some((booking) => booking.status === 'booked' && booking.bookedDay === game.day && booking.city === city && booking.venueId === venue.id)) { setMessage('That show is already booked. Complete it before booking the same slot again.'); return; }
    const setlistId = tour.setlists.find((item) => item.songIds.join(',') === selected.join(','))?.id ?? tour.saveSetlist(`${game.artist.name} · ${city} set`, selected);
    if (!setlistId) { setMessage('Choose at least one released song for the setlist.'); return; }
    const feePaid = venue.rental + venue.guarantee;
    const current = useGame.getState();
    if (current.money < feePaid || current.energy < energyCost) { setMessage('Check your available cash and energy before booking.'); return; }
    const id = tour.book({ setlistId, city, venueId: venue.id, ticketPrice: price, bookedDay: game.day, estimate, feePaid });
    useGame.setState((state) => ({ money: state.money - feePaid, ledger: [{ id: `tour-deposit-${id}`, day: state.day, description: `Tour booking · ${venue.name}`, amount: -feePaid, balanceAfter: state.money - feePaid, bucket: 'cash' as const }, ...state.ledger].slice(0, 100) }));
    setMessage(`Booked ${venue.name} · ${money(feePaid)} paid for the room and guarantee. The show is waiting for you.`);
    void id;
  };
  const completeShow = () => {
    if (!activeBooking) return;
    const bookingVenue = TOUR_VENUES.find((item) => item.id === activeBooking.venueId);
    if (!bookingVenue) { setMessage('This venue is no longer available.'); return; }
    const current = useGame.getState();
    const demand = cityDemandOf(current, activeBooking.city);
    const resolved = resolveTour(activeBooking, bookingVenue, current.day, demand);
    const result = resolved;
    const settlement = result.profit + (activeBooking.feePaid ?? 0);
    const requiredCash = Math.max(0, -settlement);
    if (current.energy < result.energySpent) { setMessage(`You need ${result.energySpent} energy to play this show.`); return; }
    if (current.money < requiredCash) { setMessage(`You need ${money(requiredCash)} cash to cover this show's costs.`); return; }
    if (!useTourStore.getState().bookings.some((booking) => booking.id === activeBooking.id && booking.status === 'booked')) { setMessage('That show is already complete.'); return; }
    useGame.setState((state) => {
      if (state.energy < result.energySpent || state.money < requiredCash) return { lastEvent: 'Show blocked: check cash and energy before taking the stage.' };
      const net = settlement;
      const nextMoney = state.money + net;
      const nextFans = state.fans + result.fansGained;
      const detail = `${bookingVenue.name}, ${activeBooking.city}: ${result.headline} · +${result.fansGained.toLocaleString()} fans · −${result.energySpent} energy.`;
      return {
        money: nextMoney,
        fans: nextFans,
        monthlyListeners: state.monthlyListeners + Math.round(result.fansGained * 0.35),
        energy: Math.max(0, state.energy - result.energySpent),
        hype: Math.min(100, state.hype + (result.actualSales >= activeBooking.estimate.expectedSales ? 5 : 2)),
        cityDemand: { ...state.cityDemand, [activeBooking.city]: Math.min(50, (state.cityDemand[activeBooking.city] ?? 0) + 1) },
        lastEvent: detail,
        notifications: [detail, ...state.notifications].slice(0, 8),
        history: [{ id: `tour-${activeBooking.id}`, day: state.day, time: state.time, title: `Show completed · ${bookingVenue.name}`, detail }, ...state.history].slice(0, 100),
        ledger: [{ id: `tour-ledger-${activeBooking.id}`, day: state.day, description: `Tour show · ${bookingVenue.name}`, amount: net, balanceAfter: nextMoney, bucket: 'cash' as const }, ...state.ledger].slice(0, 100),
      };
    });
    tour.complete(activeBooking.id, result);
    setMessage(`Show complete: ${result.headline}.`);
  };

  return <section className="tour-builder" aria-labelledby="tour-title">
    <header className="tour-hero"><div><span className="tour-eyebrow">LIVE CIRCUIT · DAY {game.day}</span><h2 id="tour-title">Build a night that travels</h2><p>Use released songs, price the room, then turn a booking into an explainable show result.</p></div><div className="tour-pulse" aria-hidden="true">◎</div></header>
    {message && <p className="tour-message" role="status">{message}</p>}
    <div className="tour-card"><label htmlFor="tour-city">City</label><select id="tour-city" value={city} onChange={(event) => changeCity(event.target.value)}>{TOUR_CITIES.map((item) => <option key={item}>{item}</option>)}</select><div className="tour-venue-grid" aria-label="Venues">{TOUR_VENUES.filter((item) => item.city === city).map((item) => <button type="button" key={item.id} className={`tour-venue ${item.id === venue.id ? 'is-selected' : ''}`} onClick={() => setVenueId(item.id)}><strong>{item.name}</strong><span>{item.capacity.toLocaleString()} cap · {money(item.rental)} room</span><small>{item.vibe}</small></button>)}</div></div>
    <div className="tour-card"><div className="tour-card-heading"><div><span className="tour-eyebrow">THE RECORDS</span><h3>Setlist</h3></div><span className="tour-count">{selected.length}/12</span></div>{released.length ? <div className="tour-song-list">{released.map((song) => <label className={`tour-song ${selected.includes(song.id) ? 'is-selected' : ''}`} key={song.id}><input type="checkbox" checked={selected.includes(song.id)} onChange={() => toggleSong(song.id)}/><span><strong>{song.title}</strong><small>{song.genre} · quality {song.quality}</small></span></label>)}</div> : <p className="tour-muted">Release a song before you build a setlist.</p>}<div className="tour-save"><input value={setlistName} onChange={(event) => setSetlistName(event.target.value)} placeholder="Name this setlist" aria-label="Setlist name"/><button type="button" className="tour-button tour-button--quiet" onClick={saveSetlist}>Save</button></div>{tour.setlists.length > 0 && <label className="tour-reuse">Reuse saved setlist<select value="" onChange={(event) => { const item = tour.setlists.find((entry) => entry.id === event.target.value); if (item) setSelected(item.songIds.filter((id) => released.some((song) => song.id === id))); }}><option value="">Choose a setlist…</option>{tour.setlists.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>}</div>
    <div className="tour-card tour-forecast"><div className="tour-card-heading"><div><span className="tour-eyebrow">THE READ</span><h3>Night forecast</h3></div><span className={`tour-risk tour-risk--${estimate.risk}`}>{estimate.risk} risk</span></div><div className="tour-stats"><div><span>Demand</span><strong>{estimate.demand}%</strong></div><div><span>Expected seats</span><strong>{estimate.expectedSales.toLocaleString()}</strong></div><div><span>Gross</span><strong>{money(estimate.gross)}</strong></div><div><span>Costs</span><strong>−{money(estimate.costs)}</strong></div><div className={estimate.expectedProfit >= 0 ? 'is-positive' : 'is-negative'}><span>Expected profit</span><strong>{estimate.expectedProfit >= 0 ? '+' : '−'}{money(Math.abs(estimate.expectedProfit))}</strong></div></div><p className="tour-confidence">{estimate.confidence}. {city === game.currentCity ? 'Home-city familiarity is helping.' : 'A new city means a softer first-night conversion.'} City demand starts at 50 and gains one point per performance.</p><label className="tour-range">Ticket price <output>{money(price)}</output><input type="range" min="5" max="200" step="1" value={price} onChange={(event) => setPrice(Number(event.target.value))}/></label><p className="tour-cost-note">Booking pays {money(venue.rental + venue.guarantee)} upfront; playing costs {energyCost} energy. Remaining ticket income and costs settle after the show. Travel is not simulated in this planner.</p></div>
    <div className="tour-actions">{activeBooking ? <><div className="tour-booked"><strong>Booked · {activeBooking.city}</strong><span>{TOUR_VENUES.find((item) => item.id === activeBooking.venueId)?.name} · Day {activeBooking.bookedDay}</span></div><button type="button" className="tour-button tour-button--primary" onClick={completeShow}>Complete show</button></> : <button type="button" className="tour-button tour-button--primary" onClick={bookShow} disabled={!released.length}>Book this show</button>}</div>
  </section>;
}
