function groupIndian(whole: string): string {
  if (whole.length <= 3) return whole;
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

/**
 * Display a server amount exactly as the backend sent it — never re-round.
 * Whole rupees print without decimals (₹221, ₹1,25,000); paise print with two (₹10.95).
 * Same rule in the kitchen/rider app and admin panel so amounts match to the paisa.
 */
export function formatInr(amount: number | null | undefined): string {
  const value = Math.round((Number(amount) || 0) * 100) / 100;
  const abs = Math.abs(value);
  const [whole, paise] = (Number.isInteger(abs) ? abs.toFixed(0) : abs.toFixed(2)).split('.');
  const body = paise ? `${groupIndian(whole!)}.${paise}` : groupIndian(whole!);
  return `${value < 0 ? '−' : ''}₹${body}`;
}

/** Server line total; "…" while a local qty change waits for the cart re-sync. */
export function formatLineTotal(itemTotal: number | null | undefined): string {
  return typeof itemTotal === 'number' && Number.isFinite(itemTotal)
    ? formatInr(itemTotal)
    : '…';
}

/** Signed bill line, e.g. "+₹0.05" / "−₹0.05" for round off. */
export function formatSignedInr(amount: number): string {
  const value = Math.round((Number(amount) || 0) * 100) / 100;
  return `${value < 0 ? '−' : '+'}${formatInr(Math.abs(value))}`;
}
