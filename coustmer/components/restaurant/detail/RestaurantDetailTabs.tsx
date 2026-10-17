import { Pressable } from '@/components/common/Pressable';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';

const ORANGE = '#F97316';
const INK = '#0B1220';
const MUTED = '#94A3B8';

export type RestaurantDetailTab = 'Menu' | 'Reviews' | 'Info' | 'Offers';

const TABS: RestaurantDetailTab[] = ['Menu', 'Offers', 'Reviews', 'Info'];

type Props = {
  active: RestaurantDetailTab;
  onChange: (tab: RestaurantDetailTab) => void;
};

export function RestaurantDetailTabs({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {TABS.map((t) => {
        const on = active === t;
        return (
          <Pressable
            key={t}
            style={styles.tab}
            onPress={() => onChange(t)}
          >
            <Text style={[styles.tabText, on && styles.tabTextOn]}>{t}</Text>
            {on ? <View style={styles.underline} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8EDF3',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
  },
  tabText: {
    fontFamily: fonts.uiSemi,
    fontSize: 13,
    color: MUTED,
  },
  tabTextOn: {
    fontFamily: fonts.uiBold,
    color: INK,
  },
  underline: {
    position: 'absolute',
    bottom: 4,
    left: '18%',
    right: '18%',
    height: 2,
    borderRadius: 1,
    backgroundColor: ORANGE,
  },
});
