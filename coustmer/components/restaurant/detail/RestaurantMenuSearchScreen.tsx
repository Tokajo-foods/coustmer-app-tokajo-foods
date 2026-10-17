import { Pressable } from '@/components/common/Pressable';
import { SmoothPressable } from '@/components/common/SmoothPressable';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Search, UtensilsCrossed, X } from 'lucide-react-native';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { VegBadge } from '@/components/restaurant/MenuBadges';
import { fonts } from '@/constants/typography';
import { navigateBack } from '@/lib/motion/navigate-back';
import { PREMIUM_LIST } from '@/lib/motion/premium';
import { useFullMenu } from '@/lib/restaurant/hooks';
import { resolveMenuItemImage } from '@/lib/restaurant/menu-item-images';
import { rankMenuSearch } from '@/lib/restaurant/menu-search';
import type { MenuItem } from '@/lib/restaurant/types';
import { formatInr } from '@/lib/format/money';

const ORANGE = '#F97316';
const INK = '#0F172A';
const MUTED = '#64748B';
const LINE = '#F1F5F9';
const FIELD = '#F8FAFC';

export function RestaurantMenuSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ restaurantId?: string; name?: string }>();
  const restaurantId = String(
    Array.isArray(params.restaurantId) ? params.restaurantId[0] : params.restaurantId ?? ''
  );

  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const menu = useFullMenu(restaurantId);
  const trimmed = query.trim();
  const isTyping = trimmed.length > 0;

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  const fullMenu = useMemo(() => {
    return [...menu.items].sort((a, b) => {
      const cat = (a.categoryName ?? '').localeCompare(b.categoryName ?? '');
      if (cat !== 0) return cat;
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  }, [menu.items]);

  const listData = useMemo(() => {
    if (isTyping) {
      return rankMenuSearch(menu.items, trimmed, { limit: fullMenu.length || 999 });
    }
    return fullMenu;
  }, [isTyping, menu.items, trimmed, fullMenu]);

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

  const listHeader = (
    <View style={styles.listHead}>
      {!isTyping ? (
        <Text style={styles.helper}>
          Tap a dish below or start typing to search
        </Text>
      ) : listData.length > 0 ? (
        <Text style={styles.matchCount}>
          {listData.length} match{listData.length === 1 ? '' : 'es'}
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.searchBar}>
        <SmoothPressable
          onPress={goBack}
          style={styles.backBtn}
          pressScale={0.9}
          accessibilityLabel="Back to menu"
        >
          <ArrowLeft color={INK} size={22} strokeWidth={2.2} />
        </SmoothPressable>

        <View style={styles.inputWrap}>
          <Search color={MUTED} size={16} strokeWidth={2.5} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search dishes in this menu"
            placeholderTextColor={MUTED}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="never"
            selectionColor={ORANGE}
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              hitSlop={10}
            >
              <X color={MUTED} size={16} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {menu.isLoading ? (
        <ActivityIndicator color={ORANGE} style={styles.loader} />
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          {...PREMIUM_LIST}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          ListEmptyComponent={
            isTyping ? (
              <Text style={styles.empty}>
                No dishes match “{trimmed}”.
              </Text>
            ) : (
              <Text style={styles.empty}>
                Start typing to search this menu.
              </Text>
            )
          }
          renderItem={({ item }) => (
            <SuggestionRow item={item} onPress={() => openItem(item)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function SuggestionRow({
  item,
  onPress,
}: {
  item: MenuItem;
  onPress: () => void;
}) {
  const photo = resolveMenuItemImage(item.name, item.imageUrl);
  return (
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
          <Text style={styles.meta} numberOfLines={1}>{item.categoryName}</Text>
        ) : null}
      </View>
      <Text style={styles.price}>{formatInr(item.price)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  backBtn: {
    padding: 6,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FIELD,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    minHeight: 44,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.ui,
    fontSize: 15,
    color: INK,
    padding: 0,
  },
  loader: {
    marginTop: 40,
  },
  listHead: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  helper: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  matchCount: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: MUTED,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FIELD,
  },
  copy: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: {
    flex: 1,
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: INK,
  },
  meta: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  price: {
    fontFamily: fonts.uiSemi,
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
