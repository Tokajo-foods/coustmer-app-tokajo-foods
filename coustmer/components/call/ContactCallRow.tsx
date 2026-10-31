import { Image } from 'expo-image';
import { Bike, MessageCircle, PhoneCall, Star, Store, Wifi } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { fonts } from '@/constants/typography';
import type { CallRole } from '@/lib/call/types';

const ORANGE = '#FF6A00';
const INK = '#111827';
const MUTED = '#6B7280';

export type ContactActionState = 'ready' | 'unavailable' | 'busy' | 'on_call';

type Props = {
  role: CallRole;
  name: string;
  caption: string;
  imageUrl?: string | null;
  rating?: string | null;
  internet: ContactActionState;
  onInternet: () => void;
  onChat?: () => void;
};

function Avatar({ role, name, imageUrl }: { role: CallRole; name: string; imageUrl?: string | null }) {
  const uri = imageUrl?.trim();
  if (uri) return <Image source={{ uri }} style={styles.avatarImage} contentFit="cover" transition={120} />;
  const initial = name.trim().charAt(0).toUpperCase();
  if (role === 'rider' && /[A-Z]/.test(initial)) return <Text style={styles.initial}>{initial}</Text>;
  return role === 'rider'
    ? <Bike color={ORANGE} size={20} strokeWidth={2.3} />
    : <Store color={ORANGE} size={20} strokeWidth={2.3} />;
}

function RoundAction(props: {
  label: string;
  hint: string;
  tint: string;
  state: ContactActionState;
  icon: ReactNode;
  onPress: () => void;
}) {
  const { state, tint } = props;
  const live = state === 'on_call';
  return (
    <Pressable
      onPress={props.onPress}
      disabled={state === 'busy' || live}
      accessibilityRole="button"
      accessibilityLabel={props.hint}
      style={styles.action}
    >
      <View
        style={[
          styles.actionCircle,
          { backgroundColor: live ? '#16A34A' : `${tint}1A`, borderColor: live ? '#16A34A' : `${tint}33` },
          state === 'unavailable' && styles.dim,
        ]}
      >
        {state === 'busy' ? <ActivityIndicator size="small" color={tint} /> : props.icon}
      </View>
      <Text style={[styles.actionLabel, state === 'unavailable' && styles.dimText]}>
        {live ? 'On call' : props.label}
      </Text>
    </Pressable>
  );
}

/** One person on the order: who they are, then an in-app internet call. */
export function ContactCallRow(props: Props) {
  const { role, name, caption, rating, internet } = props;
  const live = internet === 'on_call';
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Avatar role={role} name={name} imageUrl={props.imageUrl} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.metaRow}>
          {rating ? (
            <View style={styles.ratingPill}>
              <Star color="#F59E0B" fill="#F59E0B" size={10} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          ) : null}
          <Text style={styles.caption} numberOfLines={1}>{caption}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        {props.onChat ? (
          <RoundAction
            label="Chat"
            hint={`Chat with ${name}`}
            tint="#2563EB"
            state="ready"
            icon={<MessageCircle color="#2563EB" size={18} strokeWidth={2.4} />}
            onPress={props.onChat}
          />
        ) : null}
        <RoundAction
          label="Internet"
          hint={`Internet call ${name}`}
          tint={ORANGE}
          state={internet}
          icon={live ? <PhoneCall color="#FFFFFF" size={18} strokeWidth={2.4} /> : <Wifi color={ORANGE} size={18} strokeWidth={2.4} />}
          onPress={props.onInternet}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF4EC',
    borderWidth: 1,
    borderColor: '#FFE4CC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  initial: { fontFamily: fonts.displayBold, fontSize: 18, color: ORANGE },
  copy: { flex: 1, minWidth: 0 },
  name: { fontFamily: fonts.displayBold, fontSize: 15, color: INK },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
  },
  ratingText: { fontFamily: fonts.uiBold, fontSize: 11, color: '#92400E' },
  caption: { flexShrink: 1, fontFamily: fonts.uiMedium, fontSize: 12, color: MUTED, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  action: { alignItems: 'center', width: 56, gap: 4 },
  actionCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontFamily: fonts.uiSemi, fontSize: 11, color: INK },
  dim: { opacity: 0.45 },
  dimText: { color: MUTED },
});
