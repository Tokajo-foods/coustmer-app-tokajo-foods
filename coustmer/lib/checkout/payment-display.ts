export type PayChoice = 'cod' | 'wallet' | 'online';

/** Cart and checkout only offer these three. Older UPI/card picks are pay online. */
export function canonicalPayChoice(method: string): PayChoice {
  const value = method.trim().toLowerCase();
  if (value === 'cod' || value === 'cash' || value === 'cash_on_delivery') return 'cod';
  if (value === 'wallet' || value === 'tokajo_wallet') return 'wallet';
  return 'online';
}

export function paymentMethodLabel(method: string, isTakeaway = false): string {
  switch (canonicalPayChoice(method)) {
    case 'cod':
      return isTakeaway ? 'Pay at counter' : 'Cash on delivery';
    case 'wallet':
      return 'Wallet';
    case 'online':
      return 'Pay online';
  }
}

export function paymentMethodHint(method: string, isTakeaway = false): string {
  switch (canonicalPayChoice(method)) {
    case 'cod':
      return isTakeaway
        ? 'Pay at the restaurant when you collect'
        : 'Pay cash when the order arrives';
    case 'wallet':
      return 'Pay the full bill from your Tokajo balance';
    case 'online':
      return 'GPay, PhonePe, Paytm, cards and netbanking';
  }
}
