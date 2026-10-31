import { BellRing } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { authTheme } from '@/constants/auth-theme';
import { fonts } from '@/constants/typography';
import { loadNotifications } from '@/lib/notification/load-notifications';
import { registerCustomerPushDevice } from '@/lib/notification/push-device';

type PermissionState = { granted: boolean; canAskAgain: boolean } | null;

/** Shown only when OS notifications are off for this app. */
export function PushPermissionBanner() {
  const [perm, setPerm] = useState<PermissionState>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const N = await loadNotifications();
    if (!N) return;
    const p = await N.getPermissionsAsync().catch(() => null);
    if (p) setPerm({ granted: p.status === 'granted', canAskAgain: p.canAskAgain !== false });
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    void refresh();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const enable = async () => {
    const N = await loadNotifications();
    if (!N || !perm) return;
    if (!perm.canAskAgain) {
      void Linking.openSettings();
      return;
    }
    setBusy(true);
    try {
      const res = await N.requestPermissionsAsync();
      if (res.status === 'granted') await registerCustomerPushDevice(N).catch(() => null);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  if (!perm || perm.granted) return null;

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <BellRing color="#374151" size={18} strokeWidth={2.2} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Enable push notifications</Text>
        <Text style={styles.text}>Required for order status updates on this device.</Text>
      </View>
      <Pressable style={styles.btn} onPress={enable} disabled={busy}>
        <Text style={styles.btnText}>{perm.canAskAgain ? 'Enable' : 'Settings'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  body: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: authTheme.text,
    letterSpacing: -0.15,
  },
  text: {
    marginTop: 2,
    fontFamily: fonts.ui,
    fontSize: 12,
    lineHeight: 16,
    color: authTheme.textDim,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: authTheme.brand,
  },
  btnText: {
    fontFamily: fonts.uiBold,
    color: '#FFFFFF',
    fontSize: 12,
  },
});
