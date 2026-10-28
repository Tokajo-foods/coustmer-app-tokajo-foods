import { Pressable } from '@/components/common/Pressable';
import { X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { authTheme } from '@/constants/auth-theme';
import { formatInr } from '@/lib/format/money';
import { isNativeRazorpayAvailable, openNativeRazorpay } from '@/lib/payment/razorpay-native';
import { upiIntentConfig, type RazorpayUpiApp } from '@/lib/payment/upi-app';

export type RazorpayResult = {
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  reason?: string;
};

export type RazorpaySession = {
  keyId: string;
  orderId: string;
  amount: number;
  currency?: string;
  paymentId: string;
  customerName?: string;
  email?: string;
  contact?: string;
  description?: string;
  upiApp?: RazorpayUpiApp;
};

type Props = {
  visible: boolean;
  session: RazorpaySession | null;
  onClose: () => void;
  /** success=true only when Razorpay captured the payment. */
  onResult: (success: boolean, data: RazorpayResult) => void;
};

function esc(value: string | undefined): string {
  return String(value ?? '').replace(/[\\"'<>]/g, '');
}

const MOBILE_UA =
  'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

/** UPI apps leave the WebView via upi:// or intent://. Open those outside the page. */
function openUpiApp(url: string): boolean {
  const lower = url.toLowerCase();
  const external =
    lower.startsWith('upi:') ||
    lower.startsWith('intent:') ||
    lower.startsWith('tez:') ||
    lower.startsWith('gpay:') ||
    lower.startsWith('phonepe:') ||
    lower.startsWith('paytmmp:') ||
    lower.startsWith('paytm:') ||
    lower.startsWith('bhim:');
  if (!external) return false;
  let target = url;
  if (lower.startsWith('intent:')) {
    const scheme = url.match(/scheme=([^;]+)/)?.[1];
    const path = url.replace(/^intent:\/\//, '').split('#')[0];
    target = scheme ? `${scheme}://${path}` : url;
  }
  void Linking.openURL(target).catch(() => {
    Alert.alert('UPI app', 'That UPI app did not open. Choose UPI and enter the UPI id instead.');
  });
  return true;
}

/**
 * Razorpay checkout. Dev-client / EAS builds use the native SDK (real UPI intent to
 * GPay / PhonePe / Paytm); Expo Go falls back to Standard Checkout in a WebView.
 * Key + order id always come from the backend `initiate` response.
 */
export function RazorpayCheckoutModal({ visible, session, onClose, onResult }: Props) {
  const [loading, setLoading] = useState(true);
  const native = useMemo(() => isNativeRazorpayAvailable(), []);
  const openedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!native || !visible || !session) {
      if (!visible) openedFor.current = null;
      return;
    }
    if (openedFor.current === session.orderId) return;
    openedFor.current = session.orderId;
    void openNativeRazorpay(session).then(({ success, data }) => onResult(success, data));
  }, [native, visible, session, onResult]);

  const html = useMemo(() => {
    if (!session) return '';
    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
</head>
<body style="margin:0;background:#F4F5F7;font-family:-apple-system,Roboto,sans-serif;">
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;color:#64748B;">
    <div id="msg">Opening secure payment…</div>
  </div>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    function post(obj){
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
      }
    }
    function start(){
      if (typeof Razorpay === 'undefined') {
        post({ type:'PAYMENT_COMPLETE', success:false, reason:'gateway_load_failed' });
        return;
      }
      var options = {
        key: "${esc(session.keyId)}",
        order_id: "${esc(session.orderId)}",
        currency: "${esc(session.currency) || 'INR'}",
        name: "Tokajo Foods",
        description: "${esc(session.description) || 'Order payment'}",
        prefill: {
          name: "${esc(session.customerName)}",
          email: "${esc(session.email)}",
          contact: "${esc(session.contact)}"
        },
        theme: { color: "#F97316" },
        retry: { enabled: true },
        method: ${session.upiApp ? '{ upi: true, card: false, netbanking: false, wallet: false }' : '{ upi: true, card: true, netbanking: true, wallet: true }'},
        config: ${session.upiApp ? JSON.stringify(upiIntentConfig(session.upiApp)) : `{
          display: {
            blocks: {
              upi: {
                name: "UPI",
                instruments: [{ method: "upi", flows: ["collect", "intent", "qr"] }]
              }
            },
            sequence: ["block.upi"],
            preferences: { show_default_blocks: true }
          }
        }`},
        handler: function(resp){
          post({
            type:'PAYMENT_COMPLETE',
            success:true,
            gatewayPaymentId: resp.razorpay_payment_id,
            gatewayOrderId: resp.razorpay_order_id,
            gatewaySignature: resp.razorpay_signature
          });
        },
        modal: {
          escape: true,
          backdropclose: false,
          ondismiss: function(){
            post({ type:'PAYMENT_COMPLETE', success:false, reason:'dismissed' });
          }
        }
      };
      try {
        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function(resp){
          var desc = (resp && resp.error && resp.error.description) || 'payment_failed';
          post({ type:'PAYMENT_COMPLETE', success:false, reason: desc });
        });
        rzp.open();
      } catch (e) {
        post({ type:'PAYMENT_COMPLETE', success:false, reason: String(e) });
      }
    }
    if (document.readyState === 'complete') { start(); }
    else { window.addEventListener('load', start); }
  </script>
</body>
</html>`;
  }, [session]);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as RazorpayResult & {
        type?: string;
        success?: boolean;
      };
      if (data.type === 'PAYMENT_COMPLETE') {
        onResult(Boolean(data.success), {
          gatewayPaymentId: data.gatewayPaymentId,
          gatewayOrderId: data.gatewayOrderId,
          gatewaySignature: data.gatewaySignature,
          reason: data.reason,
        });
      }
    } catch {
      // ignore malformed messages
    }
  };

  if (native) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Secure Payment</Text>
            <Text style={styles.headerSubtitle}>
              {session?.keyId.startsWith('rzp_test_')
                ? `${formatInr(Number(session?.amount ?? 0))} · Test payment`
                : `${formatInr(Number(session?.amount ?? 0))} · Secure checkout`}
            </Text>
          </View>
          <Pressable
            style={styles.headerBtn}
            onPress={() =>
              Alert.alert('Cancel payment?', 'Your order is saved. You can pay again.', [
                { text: 'Keep paying', style: 'cancel' },
                { text: 'Cancel', style: 'destructive', onPress: onClose },
              ])
            }
          >
            <X color={authTheme.text} size={20} />
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={authTheme.brand} />
            <Text style={styles.loadingText}>Loading secure payment…</Text>
          </View>
        )}

        {session ? (
          <WebView
            source={{ html, baseUrl: 'https://checkout.razorpay.com' }}
            style={styles.webView}
            originWhitelist={['*']}
            userAgent={MOBILE_UA}
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={(request) => !openUpiApp(request.url)}
            onLoadEnd={() => setLoading(false)}
            onMessage={handleMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            mixedContentMode="always"
            onError={() => {
              setLoading(false);
              onResult(false, { reason: 'gateway_load_failed' });
            }}
          />
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: authTheme.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: authTheme.cardBorder,
    backgroundColor: authTheme.surface,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: authTheme.text },
  headerSubtitle: { fontSize: 13, color: authTheme.textMuted, marginTop: 2 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: authTheme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    gap: 16,
  },
  loadingText: { fontSize: 16, color: authTheme.textMuted, fontWeight: '500' },
  webView: { flex: 1, backgroundColor: authTheme.bg },
});
