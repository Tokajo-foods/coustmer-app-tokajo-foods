import { ArrowRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { fonts } from '@/constants/typography';

const ORANGE = '#F97316';

type Props = {
  Icon: LucideIcon;
  title: string;
  onSeeAll?: () => void;
};

/** "🔥 Trending Near You  ...  See All →" row. */
export function TokajoSectionHeader({ Icon, title, onSeeAll }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconBadge}>
          <Icon color={ORANGE} size={16} strokeWidth={2.7} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      {onSeeAll ? (
        <Pressable style={styles.seeAll} onPress={onSeeAll} hitSlop={8}>
          <Text style={styles.seeAllText}>See all</Text>
          <ArrowRight color={ORANGE} size={14} strokeWidth={2.8} />
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
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
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF1E6',
  },
  seeAllText: {
    fontFamily: fonts.uiBold,
    fontSize: 12.5,
    color: ORANGE,
  },
});
