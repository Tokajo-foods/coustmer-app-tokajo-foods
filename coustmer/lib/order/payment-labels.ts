import { fonts } from '@/constants/typography';

export function paymentMethodLabel(
  method: string,
  savedMethods?: {
    id: string;
    type?: string;
    upiId?: string;
    brand?: string;
    last4?: string;
  }[],
  isTakeaway = false,
): string {
  switch (method) {
    case 'cod':
      return isTakeaway ? 'Pay at counter' : 'Pay on Delivery';
    case 'paytm_upi':
      return 'Paytm UPI';
    case 'gpay':
      return 'Google Pay';
    case 'phonepe':
      return 'PhonePe';
    case 'netbanking':
      return 'Netbanking';
    case 'upi':
      return 'UPI';
    case 'wallet':
      return 'Tokajo Foods Wallet';
    case 'card':
      return 'Credit / Debit Card';
    default: {
      const saved = savedMethods?.find((m) => m.id === method);
      if (!saved) return 'Choose payment';
      if (saved.type === 'upi' && saved.upiId) return saved.upiId;
      if (saved.type === 'card' && saved.last4) {
        return `${(saved.brand || 'Card').toUpperCase()} •••• ${saved.last4}`;
      }
      return 'Saved payment';
    }
  }
}

export function paymentMethodHint(method: string, isTakeaway = false): string {
  switch (method) {
    case 'cod':
      return isTakeaway ? 'Pay at the restaurant counter' : 'Cash or UPI at delivery';
    case 'paytm_upi':
    case 'gpay':
    case 'phonepe':
    case 'upi':
      return 'Opens a secure Razorpay window';
    case 'netbanking':
      return 'Pay from your bank in Razorpay';
    case 'wallet':
      return 'Pay from Tokajo Foods Wallet';
    case 'card':
      return 'Secure card payment';
    default:
      return 'Tap to change';
  }
}

export { fonts };
