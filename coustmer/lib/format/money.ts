/**
 * Display a server amount exactly as the backend sent it — never re-round.
 * Whole rupees print without decimals (₹221); paise print with two (₹10.95).
 */
export function formatInr(amount: number | null | undefined): string {
  const value = Math.round((Number(amount) || 0) * 100) / 100;
  const abs = Math.abs(value);
  const body = Number.isInteger(abs) ? abs.toFixed(0) : abs.toFixed(2);
  return `${value < 0 ? '−' : ''}₹${body}`;
}

/** Signed bill line, e.g. "+₹0.05" / "−₹0.05" for round off. */
export function formatSignedInr(amount: number): string {
  const value = Math.round((Number(amount) || 0) * 100) / 100;
  return `${value < 0 ? '−' : '+'}${formatInr(Math.abs(value))}`;
}
