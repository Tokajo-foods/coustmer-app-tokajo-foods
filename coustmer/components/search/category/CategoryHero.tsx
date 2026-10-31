import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { fonts } from '@/constants/typography';

import { searchColors } from '../search-styles';

type Props = {
  title: string;
  art?: ImageSourcePropType | { uri: string };
  dishCount: number;
  restaurantCount: number;
  loading: boolean;
  topInset: number;
};

export const CATEGORY_HERO_BAR = 52;

function countsLine(loading: boolean, dishes: number, restaurants: number): string {
  if (loading) return 'Finding the best picks near you…';
  if (!dishes) return 'Near your delivery address';
  const d = `${dishes} dish${dishes === 1 ? '' : 'es'}`;
  const r = `${restaurants} restaurant${restaurants === 1 ? '' : 's'}`;
  return `${d} from ${r} near you`;
}

/** Warm banner with the category artwork; sits under the floating top bar. */
export function CategoryHero({ title, art, dishCount, restaurantCount, loading, topInset }: Props) {
  return (
    <LinearGradient
      colors={['#FFE2C7', '#FFF1E4', '#FFFFFF']}
      locations={[0, 0.65, 1]}
      style={[styles.root, { paddingTop: topInset + CATEGORY_HERO_BAR }]}
    >
      <View style={styles.copy}>
        <Text style={styles.kicker}>CRAVING</Text>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.sub} numberOfLines={2}>{countsLine(loading, dishCount, restaurantCount)}</Text>
      </View>
      <View style={styles.artWrap}>
        <View style={styles.artGlow} />
        {art ? (
          <Image source={art} style={styles.art} contentFit="cover" transition={200} />
        ) : (
          <View style={[styles.art, styles.artFallback]}>
            <Text style={styles.artLetter}>{title.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const ART = 116;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 12,
  },
  copy: { flex: 1, gap: 4 },
  kicker: { fontFamily: fonts.uiBold, fontSize: 11, letterSpacing: 1.4, color: '#C2410C' },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    lineHeight: 34,
    color: searchColors.ink,
    letterSpacing: -0.5,
    textTransform: 'capitalize',
  },
  sub: { fontFamily: fonts.uiMedium, fontSize: 13, color: '#52525B', marginTop: 2 },
  artWrap: { width: ART + 12, height: ART + 12, alignItems: 'center', justifyContent: 'center' },
  artGlow: {
    position: 'absolute',
    width: ART + 12,
    height: ART + 12,
    borderRadius: (ART + 12) / 2,
    backgroundColor: 'rgba(249,115,22,0.14)',
  },
  art: { width: ART, height: ART, borderRadius: ART / 2, backgroundColor: '#FFFFFF' },
  artFallback: { alignItems: 'center', justifyContent: 'center' },
  artLetter: { fontFamily: fonts.displayBold, fontSize: 44, color: searchColors.orange },
});
