import { LinearGradient } from 'expo-linear-gradient';
import { ChefHat, Store, UtensilsCrossed } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { fonts } from '@/constants/typography';

import { searchColors } from '../search-styles';

const SCOPES = [
  { label: 'Dishes', Icon: UtensilsCrossed },
  { label: 'Cuisines', Icon: ChefHat },
  { label: 'Restaurants', Icon: Store },
] as const;

/** Landing headline: tells the customer what the field can find. */
export function SearchHero() {
  return (
    <Animated.View entering={FadeInDown.duration(360).delay(60)} style={styles.wrap}>
      <LinearGradient
        colors={['#FFEDD5', '#FFF7ED', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.eyebrow}>DISCOVER</Text>
        <Text style={styles.title}>What are you craving today?</Text>
        <Text style={styles.body}>Search across menus, cuisines and restaurants that deliver to you.</Text>
        <View style={styles.scopes}>
          {SCOPES.map(({ label, Icon }) => (
            <View key={label} style={styles.scope}>
              <View style={styles.scopeIcon}>
                <Icon color={searchColors.orange} size={14} strokeWidth={2.4} />
              </View>
              <Text style={styles.scopeText}>{label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingTop: 16 },
  card: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#FDE6CF',
    overflow: 'hidden',
  },
  eyebrow: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: searchColors.orange,
    marginBottom: 6,
  },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, color: searchColors.ink, letterSpacing: -0.4 },
  body: { fontFamily: fonts.ui, fontSize: 13.5, lineHeight: 19, color: '#475569', marginTop: 6 },
  scopes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  scope: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
    paddingRight: 11,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  scopeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeText: { fontFamily: fonts.uiMedium, fontSize: 12.5, color: searchColors.ink },
});
