import { Pressable } from '@/components/common/Pressable';
import { copyTextToClipboard } from '@/lib/clipboard/copy-text';
import {
  Copy,
  MessageCircle,
  Send,
  Share2,
  X,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fonts } from '@/constants/typography';
import {
  buildRestaurantShareUrls,
  type RestaurantShareTarget,
} from '@/lib/restaurant/share-link';

const ORANGE = '#F97316';
const INK = '#0B1220';
const MUTED = '#64748B';

type Props = {
  visible: boolean;
  restaurant: RestaurantShareTarget | null;
  onClose: () => void;
};

type ShareAction = {
  id: string;
  label: string;
  icon: typeof Share2;
  onPress: () => void | Promise<void>;
};

export function RestaurantShareSheet({ visible, restaurant, onClose }: Props) {
  const [copying, setCopying] = useState(false);

  if (!restaurant?.id) return null;

  const urls = buildRestaurantShareUrls(restaurant);

  const copyLink = async () => {
    setCopying(true);
    try {
      const ok = await copyTextToClipboard(urls.primaryUrl);
      if (ok) {
        Alert.alert('Link copied', 'Restaurant link copied to clipboard.');
        onClose();
      } else {
        Alert.alert('Copy failed', 'Could not copy the link. Try Share instead.');
      }
    } catch {
      Alert.alert('Copy failed', 'Could not copy the link. Try again.');
    } finally {
      setCopying(false);
    }
  };

  const openWhatsApp = async () => {
    const text = encodeURIComponent(urls.message);
    const wa = `whatsapp://send?text=${text}`;
    const web = `https://wa.me/?text=${text}`;
    try {
      const can = await Linking.canOpenURL(wa);
      await Linking.openURL(can ? wa : web);
      onClose();
    } catch {
      await Share.share({ message: urls.message });
    }
  };

  const openTelegram = async () => {
    const url = encodeURIComponent(urls.primaryUrl);
    const text = encodeURIComponent(`Order from ${restaurant.name ?? 'this restaurant'} on TOKAJO`);
    const tg = `https://t.me/share/url?url=${url}&text=${text}`;
    try {
      await Linking.openURL(tg);
      onClose();
    } catch {
      await Share.share({ message: urls.message });
    }
  };

  const nativeShare = async () => {
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message: urls.message, url: urls.primaryUrl }
          : { message: urls.message }
      );
      onClose();
    } catch {
      /* user dismissed */
    }
  };

  const actions: ShareAction[] = [
    { id: 'copy', label: copying ? 'Copying…' : 'Copy link', icon: Copy, onPress: copyLink },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, onPress: openWhatsApp },
    { id: 'telegram', label: 'Telegram', icon: Send, onPress: openTelegram },
    { id: 'more', label: 'More apps', icon: Share2, onPress: nativeShare },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTap} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <Text style={styles.title}>Share restaurant</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X color={MUTED} size={22} />
            </Pressable>
          </View>
          <Text style={styles.sub} numberOfLines={2}>
            {restaurant.name}
          </Text>

          <View style={styles.grid}>
            {actions.map((action) => (
              <Pressable
                key={action.id}
                style={styles.action}
                onPress={() => void action.onPress()}
              >
                <View style={styles.actionIcon}>
                  <action.icon color={ORANGE} size={22} strokeWidth={2.2} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.hint} numberOfLines={2}>
            Friends must sign in and be within 15 km of this outlet to order.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: INK,
  },
  sub: {
    marginTop: 4,
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: MUTED,
  },
  grid: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  action: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    backgroundColor: '#FAFBFC',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: INK,
  },
  hint: {
    marginTop: 16,
    fontFamily: fonts.uiMedium,
    fontSize: 11,
    color: MUTED,
    lineHeight: 16,
  },
});
