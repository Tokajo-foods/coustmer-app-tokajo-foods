const { withAndroidManifest } = require('expo/config-plugins');

/**
 * Android 11+ package visibility: Razorpay UPI intent flow must be able to
 * discover installed UPI apps (GPay, PhonePe, Paytm, BHIM…).
 */
module.exports = function withRazorpayUpi(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const queries = manifest.queries ?? [{}];
    const block = queries[0];
    block.intent = block.intent ?? [];
    const hasUpi = block.intent.some((i) =>
      (i.data ?? []).some((d) => d.$?.['android:scheme'] === 'upi')
    );
    if (!hasUpi) {
      block.intent.push({
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        data: [{ $: { 'android:scheme': 'upi' } }],
      });
    }
    manifest.queries = queries;
    return cfg;
  });
};
