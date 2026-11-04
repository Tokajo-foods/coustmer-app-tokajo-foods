import { Pressable } from '@/components/common/Pressable';
import { MapPinOff } from 'lucide-react-native';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import type { CartCheckoutBlock } from '@/lib/cart/cart-checkout-gate';

const INK = '#0B1220';
const MUTED = '#64748B';
const ORANGE = '#F97316';

type Props = {
  block: CartCheckoutBlock | null;
  onClose: () => void;
  onChangeAddress?: () => void;
};

export function CartCheckoutBlockModal({ block, onClose, onChangeAddress }: Props) {
  const visible = Boolean(block);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MapPinOff color={ORANGE} size={28} strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>{block?.title ?? ''}</Text>
          <Text style={styles.body}>{block?.message ?? ''}</Text>
          {block?.changeAddress && onChangeAddress ? (
            <Pressable style={styles.secondaryBtn} onPress={onChangeAddress}>
              <Text style={styles.secondaryBtnText}>Change address</Text>
            </Pressable>
          ) : null}
          <Pressable style={styles.btn} onPress={onClose}>
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
  secondaryBtn: {
    marginTop: 16,
    width: '100%',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ORANGE,
  },
  secondaryBtnText: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: ORANGE,
  },
  btn: {
    marginTop: 10,
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
