import { Pressable } from '@/components/common/Pressable';
import { MapPinOff } from 'lucide-react-native';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { CUSTOMER_DISCOVERY_RADIUS_KM } from '@/lib/location/discovery-radius';
import { useRestaurantShareUiStore } from '@/store/restaurant-share-ui-store';

const INK = '#0B1220';
const MUTED = '#64748B';
const ORANGE = '#F97316';

export function RestaurantNotServiceableModal() {
  const name = useRestaurantShareUiStore((s) => s.notServiceableName);
  const clear = useRestaurantShareUiStore((s) => s.clearNotServiceable);
  const visible = Boolean(name);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={clear}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MapPinOff color={ORANGE} size={28} strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>Not serviceable at your location</Text>
          <Text style={styles.body}>
            {name} is outside your {CUSTOMER_DISCOVERY_RADIUS_KM} km delivery area. Change
            your delivery address or pick a restaurant nearer to you.
          </Text>
          <Pressable style={styles.btn} onPress={clear}>
            <Text style={styles.btnText}>Got it</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: INK,
    textAlign: 'center',
  },
  body: {
    marginTop: 10,
    fontFamily: fonts.uiMedium,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    marginTop: 18,
    width: '100%',
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
