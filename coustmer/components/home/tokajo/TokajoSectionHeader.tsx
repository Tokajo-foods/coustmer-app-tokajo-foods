import { ArrowRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { fonts } from '@/constants/typography';

const ORANGE = '#F97316';

type Props = {
  Icon: LucideIcon;
  title: string;
  /** Shown as “Title (12)” when set. */
  count?: number;
  onSeeAll?: () => void;
  seeAllLabel?: string;
  /** Tighter type so title + count + action stay on one row. */
  dense?: boolean;
  seeAllAccessibilityLabel?: string;
};

/** Section row with optional count and See all action. */
export function TokajoSectionHeader({
  Icon,
  title,
  count,
  onSeeAll,
  seeAllLabel = 'See all',
  dense = false,
  seeAllAccessibilityLabel,
}: Props) {
  const titleStyle = dense ? styles.titleDense : styles.title;
  const countStyle = dense ? styles.countDense : styles.count;

  return (
    <View style={styles.row}>
      <View style={[styles.left, dense && styles.leftDense]}>
        <View style={[styles.iconBadge, dense && styles.iconBadgeDense]}>
          <Icon color={ORANGE} size={dense ? 15 : 16} strokeWidth={2.7} />
        </View>
        <View style={styles.titleWrap}>
          <Text
            style={titleStyle}
            numberOfLines={1}
            ellipsizeMode="tail"
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            {title}
            {typeof count === 'number' ? (
              <Text style={countStyle}> ({count})</Text>
            ) : null}
          </Text>
        </View>
      </View>
      {onSeeAll ? (
        <Pressable
          style={[styles.seeAll, dense && styles.seeAllDense]}
          onPress={onSeeAll}
          hitSlop={8}
          accessibilityLabel={seeAllAccessibilityLabel ?? seeAllLabel}
        >
          <Text style={[styles.seeAllText, dense && styles.seeAllTextDense]} numberOfLines={1}>
            {seeAllLabel}
          </Text>
          <ArrowRight color={ORANGE} size={dense ? 13 : 14} strokeWidth={2.8} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  leftDense: {
    gap: 7,
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: '#1C1C1C',
    letterSpacing: -0.3,
  },
  titleDense: {
    fontFamily: fonts.displayBold,
    fontSize: 16.5,
    color: '#1C1C1C',
    letterSpacing: -0.28,
  },
  count: {
    fontFamily: fonts.uiSemi,
    fontSize: 16,
    color: '#78716C',
    letterSpacing: -0.2,
  },
  countDense: {
    fontFamily: fonts.uiSemi,
    fontSize: 15,
    color: '#78716C',
    letterSpacing: -0.18,
  },
  iconBadgeDense: {
    width: 28,
    height: 28,
    borderRadius: 9,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF1E6',
    flexShrink: 0,
    marginLeft: 6,
  },
  seeAllDense: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 2,
    marginLeft: 4,
  },
  seeAllText: {
    fontFamily: fonts.uiBold,
    fontSize: 12.5,
    color: ORANGE,
  },
  seeAllTextDense: {
    fontSize: 11.5,
  },
});
