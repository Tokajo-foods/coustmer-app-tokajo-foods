import { ArrowRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import type { SectionTone } from '@/components/home/tokajo/TokajoSectionBand';
import { fonts } from '@/constants/typography';

const ORANGE = '#F97316';

type Props = {
  Icon: LucideIcon;
  title: string;
  subtitle?: string;
  tone?: SectionTone;
  onSeeAll?: () => void;
};

/** Section title row — adapts colors when sitting on peach / ink bands. */
export function TokajoSectionHeader({
  Icon,
  title,
  subtitle,
  tone = 'plain',
  onSeeAll,
}: Props) {
  const ink = tone === 'ink';
  const titleColor = ink ? '#FFFFFF' : '#1C1C1C';
  const subColor = ink ? 'rgba(255,255,255,0.65)' : '#8A8A8A';
  const iconColor = ink ? '#FDBA74' : ORANGE;
  const seeColor = ink ? '#FDBA74' : ORANGE;
  const chipBg = ink ? 'rgba(255,255,255,0.1)' : 'rgba(249,115,22,0.1)';

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.iconChip, { backgroundColor: chipBg }]}>
            <Icon color={iconColor} size={16} strokeWidth={2.6} />
          </View>
          <View style={styles.textCol}>
            <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: subColor }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {onSeeAll ? (
          <Pressable style={styles.seeAll} onPress={onSeeAll} hitSlop={8}>
            <Text style={[styles.seeAllText, { color: seeColor }]}>See All</Text>
            <ArrowRight color={seeColor} size={15} strokeWidth={2.6} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.ui,
    fontSize: 12,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  seeAllText: {
    fontFamily: fonts.uiBold,
    fontSize: 13,
  },
});
