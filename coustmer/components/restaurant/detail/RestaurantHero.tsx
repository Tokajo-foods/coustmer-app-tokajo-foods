import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Clock, MapPin, Share2, Star } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Pressable } from '@/components/common/Pressable';
import { fonts } from '@/constants/typography';

export type RestaurantHeroProps = {
  cover: string;
  logo?: string;
  name: string;
  cuisineLine?: string | null;
  offerBadges: string[];
  dutyLabel?: string | null;
  ratingText?: string | null;
  reviewsCount?: string | null;
  distanceLabel?: string | null;
  eta?: string | null;
  locationText: string;
  status: { loading: boolean; closed: boolean; open: boolean; nextOpenLabel?: string | null };
  onBack: () => void;
  onShare: () => void;
};

function StatusPill({ status, dutyLabel }: Pick<RestaurantHeroProps, 'status' | 'dutyLabel'>) {
  if (status.loading) {
    return (
      <View style={[styles.statusPill, styles.pendingPill]}>
        <Text style={styles.statusText}>…</Text>
      </View>
    );
  }
  if (status.closed) {
    const label = dutyLabel
      ? dutyLabel.startsWith('On a break') ? 'On a break' : 'Offline'
      : status.nextOpenLabel ? `Opens ${status.nextOpenLabel}` : 'Closed';
    return (
      <View style={[styles.statusPill, styles.closedPill]}>
        <Text style={styles.statusText}>{label}</Text>
      </View>
    );
  }
  if (status.open) {
    return (
      <View style={[styles.statusPill, styles.openPill]}>
        <Text style={styles.statusText}>Open</Text>
      </View>
    );
  }
  return null;
}

function Stat({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <>
      <View style={styles.metaDot} />
      <View style={styles.statPill}>
        {icon}
        <Text style={styles.statPillText}>{label}</Text>
      </View>
    </>
  );
}

export function RestaurantHero(p: RestaurantHeroProps) {
  return (
    <View style={styles.heroWrap}>
      {p.cover ? (
        <Image source={{ uri: p.cover }} style={styles.heroImage} contentFit="cover" />
      ) : (
        <View style={[styles.heroImage, styles.heroFallback]} />
      )}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.15)', 'rgba(11,18,32,0.92)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top']} style={styles.heroSafe}>
        <View style={styles.topBar}>
          <Pressable onPress={p.onBack} style={styles.glassBtn} hitSlop={8}>
            <ChevronLeft color="#FFF" size={22} strokeWidth={2.4} />
          </Pressable>
          <Pressable onPress={p.onShare} style={styles.glassBtn} hitSlop={8} accessibilityLabel="Share restaurant">
            <Share2 color="#FFF" size={20} strokeWidth={2.3} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.heroBottom}>
        <View style={styles.heroIdentity}>
          <View style={styles.logoWrap}>
            {p.logo ? (
              <Image source={{ uri: p.logo }} style={styles.logoImage} contentFit="cover" />
            ) : (
              <Text style={styles.logoFallback}>{p.name.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={2}>{p.name}</Text>
            {p.cuisineLine ? <Text style={styles.cuisineLine} numberOfLines={1}>{p.cuisineLine}</Text> : null}
            {p.offerBadges.length ? (
              <Text style={styles.offerLine} numberOfLines={1}>{p.offerBadges.join(' · ')}</Text>
            ) : null}
            {p.dutyLabel ? <Text style={styles.dutyLine} numberOfLines={2}>{p.dutyLabel}</Text> : null}
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.ratingPill}>
            <Star
              color={p.ratingText ? '#FBBF24' : 'rgba(255,255,255,0.55)'}
              fill={p.ratingText ? '#FBBF24' : 'transparent'}
              size={13}
            />
            <Text style={styles.ratingNum}>{p.ratingText ?? 'No ratings'}</Text>
            {p.reviewsCount ? <Text style={styles.ratingCount}>{p.reviewsCount}</Text> : null}
          </View>
          {p.distanceLabel ? (
            <Stat icon={<MapPin color="rgba(255,255,255,0.85)" size={12} />} label={p.distanceLabel} />
          ) : null}
          {p.eta ? <Stat icon={<Clock color="rgba(255,255,255,0.85)" size={12} />} label={p.eta} /> : null}
          <StatusPill status={p.status} dutyLabel={p.dutyLabel} />
        </View>
        <View style={styles.addressRow}>
          <MapPin color="rgba(255,255,255,0.65)" size={12} />
          <Text style={styles.locationText} numberOfLines={1}>{p.locationText}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: { height: 300, width: '100%', backgroundColor: '#111' },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroFallback: { backgroundColor: '#1E293B' },
  heroSafe: { zIndex: 2 },
  topBar: {
    paddingHorizontal: 14, paddingTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  glassBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.42)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  heroBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingBottom: 18, gap: 12 },
  heroIdentity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: '#FFF', overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
  },
  logoImage: { width: '100%', height: '100%' },
  logoFallback: { fontFamily: fonts.display, fontSize: 24, color: '#F97316' },
  name: { fontFamily: fonts.display, fontSize: 26, color: '#FFFFFF', letterSpacing: -0.6, lineHeight: 30 },
  cuisineLine: { marginTop: 2, fontFamily: fonts.uiMedium, fontSize: 13, color: 'rgba(255,255,255,0.78)' },
  offerLine: { marginTop: 4, fontFamily: fonts.uiBold, fontSize: 12, color: '#FDBA74' },
  dutyLine: { marginTop: 4, fontFamily: fonts.uiBold, fontSize: 12, color: '#FDE68A' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  ratingNum: { fontFamily: fonts.uiBold, fontSize: 12, color: '#FFF' },
  ratingCount: { fontFamily: fonts.uiMedium, fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  statPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999,
  },
  statPillText: { fontFamily: fonts.uiBold, fontSize: 11, color: '#FFF' },
  statusPill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, marginLeft: 4 },
  statusText: { fontFamily: fonts.uiBold, fontSize: 11, color: '#FFF' },
  openPill: { backgroundColor: 'rgba(34,197,94,0.95)' },
  pendingPill: { backgroundColor: 'rgba(148,163,184,0.9)' },
  closedPill: { backgroundColor: 'rgba(239,68,68,0.95)' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  locationText: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 12, color: 'rgba(255,255,255,0.75)' },
});
