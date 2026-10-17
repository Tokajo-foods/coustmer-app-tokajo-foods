import { Pressable } from '@/components/common/Pressable';
import { SmoothPressable } from '@/components/common/SmoothPressable';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Search, TrendingUp, UtensilsCrossed, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { VegBadge } from '@/components/restaurant/MenuBadges';
import { fonts } from '@/constants/typography';
import { navigateBack } from '@/lib/motion/navigate-back';
import { PREMIUM_LIST } from '@/lib/motion/premium';
import {
  featuredMenuSuggestions,
  rankMenuSearch,
} from '@/lib/restaurant/menu-search';
import { resolveMenuItemImage } from '@/lib/restaurant/menu-item-images';
import { useFullMenu } from '@/lib/restaurant/hooks';
import type { MenuItem } from '@/lib/restaurant/types';

const ORANGE = '#F97316';
const INK = '#0B1220';
const MUTED = '#64748B';
const BG = '#F6F8FB';
const BORDER = '#E8EDF3';
const SURFACE = '#FFFFFF';

export function RestaurantMenuSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ restaurantId?: string; name?: string }>();
  const restaurantId = String(
    Array.isArray(params.restaurantId) ? params.restaurantId[0] : params.restaurantId ?? ''
  );
  const restaurantName = String(
    Array.isArray(params.name) ? params.name[0] : params.name ?? 'this restaurant'
  );

  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const menu = useFullMenu(restaurantId);
  const trimmed = query.trim();
  const isTyping = trimmed.length > 0;

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 280);
    return () => clearTimeout(t);
  }, []);

  const popularItems = useMemo(
    () => featuredMenuSuggestions(menu.items, menu.recommended, 8),
    [menu.items, menu.recommended]
  );

  const suggestions = useMemo(() => {
    if (!trimmed) return popularItems;
    return rankMenuSearch(menu.items, trimmed, { limit: 40 });
  }, [menu.items, popularItems, trimmed]);

  const openItem = (item: MenuItem) => {
    Keyboard.dismiss();
    router.replace({
      pathname: '/restaurants/[restaurantId]',
      params: { restaurantId, itemId: item.id },
    } as import('expo-router').Href);
  };

  const goBack = () => {
    navigateBack(router, `/restaurants/${restaurantId}`);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <SmoothPressable
              onPress={goBack}
              style={styles.backBtn}
              pressScale={0.92}
              accessibilityLabel="Back to menu"
            >
              <ChevronLeft color={ORANGE} size={26} strokeWidth={2.4} />
            </SmoothPressable>

            <View
              style={[
                styles.searchPill,
                focused ? styles.searchPillFocused : styles.searchPillIdle,
              ]}
            >
              <Search
                color={focused ? ORANGE : '#475569'}
                size={18}
                strokeWidth={2.5}
              />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={`Search at ${restaurantName}`}
                placeholderTextColor="#94A3B8"
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="never"
                selectionColor={ORANGE}
                editable
                showSoftInputOnFocus
                importantForAutofill="no"
              />
              {query.length > 0 ? (
                <Pressable
                  onPress={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  hitSlop={8}
                  style={styles.clearBtn}
                >
                  <X color="#475569" size={15} strokeWidth={2.5} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>
      </SafeAreaView>

      <Animated.View entering={FadeInUp.delay(80).duration(300)} style={styles.body}>
        {!isTyping && popularItems.length > 0 ? (
          <View style={styles.popularBlock}>
            <View style={styles.sectionLabelRow}>
              <TrendingUp color={ORANGE} size={16} />
              <Text style={styles.sectionLabel}>Popular in this kitchen</Text>
            </View>
            <View style={styles.chipWrap}>
              {popularItems.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.chip}
                  onPress={() => setQuery(item.name)}
                >
                  <Text style={styles.chipText} numberOfLines={1}>{item.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.listTitle}>
          {isTyping
            ? suggestions.length
              ? `${suggestions.length} suggestion${suggestions.length === 1 ? '' : 's'}`
              : 'No matches'
            : 'Tap a dish or start typing'}
        </Text>

        {menu.isLoading ? (
          <ActivityIndicator color={ORANGE} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            {...PREMIUM_LIST}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            ListEmptyComponent={
              isTyping ? (
                <Text style={styles.empty}>
                  No dishes match “{trimmed}”. Try another spelling.
                </Text>
              ) : null
            }
            renderItem={({ item, index }) => (
              <SuggestionRow
                item={item}
                index={index}
                onPress={() => openItem(item)}
              />
            )}
          />
        )}
      </Animated.View>
    </View>
  );
}

function SuggestionRow({
  item,
  index,
  onPress,
}: {
  item: MenuItem;
  index: number;
  onPress: () => void;
}) {
  const photo = resolveMenuItemImage(item.name, item.imageUrl);
  return (
    <Animated.View entering={FadeInUp.delay(40 + index * 24).duration(260)}>
      <Pressable style={styles.row} onPress={onPress}>
        <View style={styles.thumb}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.thumbImg} contentFit="cover" />
          ) : (
            <View style={[styles.thumbImg, styles.thumbFallback]}>
              <UtensilsCrossed color="#94A3B8" size={16} />
            </View>
          )}
        </View>
        <View style={styles.copy}>
          <View style={styles.nameRow}>
            <VegBadge isVeg={item.isVeg} />
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          </View>
          {item.categoryName ? (
            <Text style={styles.category} numberOfLines={1}>{item.categoryName}</Text>
          ) : null}
        </View>
        <Text style={styles.price}>₹{item.price}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  headerSafe: {
    backgroundColor: SURFACE,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.35)',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 14,
    gap: 10,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  searchPillIdle: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(249, 115, 22, 0.28)',
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchPillFocused: {
    backgroundColor: '#FFFBF7',
    borderColor: ORANGE,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: fonts.uiMedium,
    fontSize: 16,
    color: INK,
    paddingVertical: 14,
    paddingHorizontal: 0,
  },
  clearBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: BORDER,
  },
  body: { flex: 1, paddingTop: 12 },
  popularBlock: { paddingHorizontal: 16, marginBottom: 8 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionLabel: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: INK,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    maxWidth: '48%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  chipText: {
    fontFamily: fonts.ui,
    fontSize: 13,
    color: INK,
  },
  listTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
    color: MUTED,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF3',
  },
  thumb: { width: 52, height: 52, borderRadius: 12, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  copy: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    flex: 1,
    fontFamily: fonts.uiBold,
    fontSize: 15,
    color: INK,
  },
  category: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  price: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    color: INK,
  },
  empty: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
  },
});
