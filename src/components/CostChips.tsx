/** Small custom cost glyphs, drawn to match the 2px HUD line weight. */
export function CashIcon() {
  return <svg className="chip-icon" viewBox="0 0 16 16" aria-label="cash" role="img"><rect x="1.5" y="4" width="13" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="8" cy="8" r="1.9" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>;
}

export function EnergyIcon() {
  return <svg className="chip-icon" viewBox="0 0 16 16" aria-label="energy" role="img"><path d="M9.2 1.5 3.5 9h4l-.8 5.5L12.5 7h-4z" fill="currentColor"/></svg>;
}
