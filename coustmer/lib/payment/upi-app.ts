/** Razorpay Checkout app ids. Intent flow opens that app with the order amount locked. */
export type RazorpayUpiApp = 'google_pay' | 'phonepe' | 'paytm';

const BY_CHOICE: Record<string, RazorpayUpiApp> = {
  gpay: 'google_pay',
  phonepe: 'phonepe',
  paytm_upi: 'paytm',
};

/** Cart row the customer tapped → the UPI app Razorpay should open. */
export function upiAppForChoice(choice: string): RazorpayUpiApp | undefined {
  return BY_CHOICE[choice];
}

/** One UPI app, intent only. Amount comes from the Razorpay order, so the customer cannot edit it. */
export function upiIntentConfig(app: RazorpayUpiApp): Record<string, unknown> {
  return {
    display: {
      blocks: {
        upi: {
          name: 'Pay with UPI',
          instruments: [{ method: 'upi', flows: ['intent'], apps: [app] }],
        },
      },
      sequence: ['block.upi'],
      preferences: { show_default_blocks: false },
    },
  };
}
