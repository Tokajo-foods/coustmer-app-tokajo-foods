import { LinearGradient } from 'expo-linear-gradient';
import { Tag } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/constants/typography';

const INK = '#0B1220';
const MUTED = '#64748B';

type Offer = { id: string; title: string; description?: string | null; code?: string | null };

export function RestaurantOffersPanel({ offers }: { offers: Offer[] }) {
  return (
    <View style={styles.pad}>
      {offers.length === 0 ? (
        <View style={styles.empty}>
          <Tag color="#F97316" size={26} />
          <Text style={styles.emptyTitle}>No live offers</Text>
          <Text style={styles.emptySub}>Check back soon — deals land here first.</Text>
        </View>
      ) : (
        offers.map((offer) => (
          <View key={offer.id} style={styles.card}>
            <LinearGradient colors={['#FFF7ED', '#FFFFFF']} style={styles.grad}>
              <Text style={styles.title}>{offer.title}</Text>
              {offer.description ? <Text style={styles.desc}>{offer.description}</Text> : null}
              {offer.code ? (
                <View style={styles.codePill}>
                  <Text style={styles.codeText}>{offer.code}</Text>
                </View>
              ) : null}
            </LinearGradient>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 16, paddingTop: 8 },
  empty: {
    marginTop: 24, padding: 28, borderRadius: 18, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', gap: 8,
  },
  emptyTitle: { fontFamily: fonts.displayBold, fontSize: 16, color: INK },
  emptySub: { fontFamily: fonts.ui, fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 18 },
  card: { marginBottom: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#FED7AA' },
  grad: { padding: 16 },
  title: { fontFamily: fonts.displayBold, fontSize: 16, color: INK },
  desc: { marginTop: 6, fontFamily: fonts.ui, fontSize: 13, color: MUTED, lineHeight: 18 },
  codePill: {
    alignSelf: 'flex-start', marginTop: 12, backgroundColor: INK, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  codeText: { fontFamily: fonts.uiBold, fontSize: 12, color: '#FFF', letterSpacing: 1 },
});
