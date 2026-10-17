import { BellRing } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { authTheme } from '@/constants/auth-theme';
import { loadNotifications } from '@/lib/notification/load-notifications';
import { registerCustomerPushDevice } from '@/lib/notification/push-device';

type PermissionState = { granted: boolean; canAskAgain: boolean } | null;

/** Shown only when OS notifications are off for this app, so order alerts would be missed. */
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
        <BellRing color={authTheme.brand} size={20} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Turn on notifications</Text>
        <Text style={styles.text}>
          Know the moment your order is accepted, being cooked and arriving at your door.
        </Text>
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
    padding: 14,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEDD5',
  },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '800', color: authTheme.text },
  text: { marginTop: 2, fontSize: 12, lineHeight: 17, color: authTheme.textMuted },
  btn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: authTheme.brand },
  btnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
