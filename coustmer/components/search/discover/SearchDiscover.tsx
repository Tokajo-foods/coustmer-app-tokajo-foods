import { MapPin, Store, WifiOff } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';
import type { HomeRestaurantCard, HomeTrendingDish } from '@/lib/home/types';
import { PREMIUM_SCROLL } from '@/lib/motion/premium';
import { useSearchDiscovery } from '@/lib/search/use-search-discovery';

import { searchColors } from '../search-styles';
import { DishRail } from './DishRail';
import { NearbyRestaurantList } from './NearbyRestaurantList';
import { RecentChips } from './RecentChips';

type Props = {
  recent: string[];
  onSearch: (term: string) => void;
  onRemoveRecent: (term: string) => void;
  onClearRecent: () => void;
  onDish: (dish: HomeTrendingDish) => void;
  onRestaurant: (r: HomeRestaurantCard) => void;
};

/** Search landing: recent searches, then suggestions from restaurants in range only. */
export function SearchDiscover({ recent, onSearch, onRemoveRecent, onClearRecent, onDish, onRestaurant }: Props) {
  const d = useSearchDiscovery();
  const nothingNearby = !d.loading && !d.failed && d.hasLocation && !d.restaurants.length;

  return (
    <ScrollView {...PREMIUM_SCROLL} contentContainerStyle={styles.content}>
      <RecentChips terms={recent} onPick={onSearch} onRemove={onRemoveRecent} onClear={onClearRecent} />
      {!d.hasLocation ? (
        <Notice icon={<MapPin color={searchColors.orange} size={26} />} title="Set your delivery location"
          body="We'll suggest dishes and restaurants that deliver to you." />
      ) : null}
      {d.loading ? <DiscoverSkeleton /> : null}
      {d.failed ? (
        <Notice icon={<WifiOff color={searchColors.orange} size={26} />} title="Couldn't load suggestions"
          body="Check your connection and try again." action={{ label: 'Retry', onPress: d.retry }} />
      ) : null}
      {!d.loading && d.dishesLoading && d.restaurants.length ? <DishRailSkeleton /> : null}
      <DishRail items={d.dishes} onPick={onDish} />
      <NearbyRestaurantList items={d.restaurants} onPick={onRestaurant} />
      {nothingNearby ? (
        <Notice icon={<Store color={searchColors.orange} size={26} />} title="No restaurants deliver here yet"
          body="Try another address, or search by dish or restaurant name." />
      ) : null}
    </ScrollView>
  );
}

type NoticeProps = {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: { label: string; onPress: () => void };
};

function Notice({ icon, title, body, action }: NoticeProps) {
  return (
    <View style={styles.notice}>
      <View style={styles.noticeIcon}>{icon}</View>
      <Text style={styles.noticeTitle}>{title}</Text>
      <Text style={styles.noticeBody}>{body}</Text>
      {action ? (
        <Pressable onPress={action.onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          accessibilityRole="button">
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function DishRailSkeleton() {
  return (
    <View style={styles.skeleton}>
      <View style={[styles.bone, styles.titleBone]} />
      <View style={styles.row}>
        {[0, 1, 2].map((i) => <View key={i} style={[styles.bone, styles.card]} />)}
      </View>
    </View>
  );
}

function DiscoverSkeleton() {
  return (
    <View style={styles.skeleton}>
      <View style={[styles.bone, styles.titleBone]} />
      <View style={styles.row}>
        {[0, 1, 2].map((i) => <View key={i} style={[styles.bone, styles.card]} />)}
      </View>
      <View style={[styles.bone, styles.titleBone, { marginTop: 26 }]} />
      {[0, 1, 2].map((i) => <View key={i} style={[styles.bone, styles.listRow]} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 120 },
  notice: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 48, gap: 6 },
  noticeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  noticeTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: searchColors.ink, textAlign: 'center' },
  noticeBody: { fontFamily: fonts.ui, fontSize: 13, color: searchColors.muted, textAlign: 'center', lineHeight: 19 },
  action: {
    marginTop: 14,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: searchColors.orange,
  },
  pressed: { opacity: 0.85 },
  actionText: { fontFamily: fonts.uiBold, fontSize: 13.5, color: '#FFFFFF' },
  skeleton: { paddingTop: 24, paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 14, overflow: 'hidden' },
  bone: { backgroundColor: '#F1F5F9' },
  titleBone: { width: 180, height: 14, borderRadius: 7, marginBottom: 14 },
  listRow: { height: 64, borderRadius: 14, marginBottom: 12 },
  card: { width: 148, height: 168, borderRadius: 16 },
});
