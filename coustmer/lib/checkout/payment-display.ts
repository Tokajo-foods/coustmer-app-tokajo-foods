import type { SavedPaymentMethod } from '@/lib/payment/types';

export function paymentMethodLabel(
  method: string,
  savedMethods?: SavedPaymentMethod[]
): string {
  switch (method) {
    case 'cod':
      return 'Pay on Delivery';
    case 'paytm_upi':
      return 'Paytm UPI';
    case 'gpay':
      return 'Google Pay';
    case 'phonepe':
      return 'PhonePe';
    case 'netbanking':
      return 'Netbanking';
    case 'wallet':
      return 'Tokajo Foods Wallet';
    case 'card':
      return 'Credit / Debit Card';
    case 'upi':
      return 'UPI';
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

export function paymentMethodHint(method: string): string {
  switch (method) {
    case 'cod':
      return 'Cash or UPI at delivery';
    case 'paytm_upi':
      return 'Opens Paytm with the order amount';
    case 'gpay':
      return 'Opens Google Pay with the order amount';
    case 'phonepe':
      return 'Opens PhonePe with the order amount';
    case 'upi':
      return 'Opens your UPI app with the order amount';
    case 'netbanking':
      return 'Choose your bank on the secure payment screen';
    case 'wallet':
      return 'Pay from Tokajo Foods Wallet';
    case 'card':
      return 'Secure card payment';
    default:
      return 'Tap to change';
  }
}
