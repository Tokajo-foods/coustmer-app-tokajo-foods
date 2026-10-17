import { Pressable } from '@/components/common/Pressable';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Circle,
  CreditCard,
  Landmark,
  Plus,
  Receipt,
  Truck,
} from 'lucide-react-native';
import { Alert, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { fonts } from '@/constants/typography';
import { formatInr } from '@/lib/format/money';
import type { SavedPaymentMethod, WalletSummary } from '@/lib/payment/types';

const ORANGE = '#F97316';
const ORANGE_DARK = '#EA580C';
const TOKAJO_YELLOW = '#FACC15';
const TEXT = '#0B1220';
const TEXT_SEC = '#64748B';
const BORDER = '#E5E7EB';
const WHITE = '#FFFFFF';

const PAYTM_LOGO = require('../../assets/images/payment/paytm.png');
const GPAY_LOGO = require('../../assets/images/payment/gpay.png');
const PHONEPE_LOGO = require('../../assets/images/payment/phonepe.png');
const TOKAJO_LOGO = require('../../assets/Logo.png');

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
  itemCount: number;
  total: number;
  savings: number;
  restaurantName: string;
  deliveryTime?: string;
  addressLabel: string;
  addressText: string;
  onPay: (method: string) => void;
  savedMethods?: SavedPaymentMethod[];
  wallet?: WalletSummary;
  /** cart-service `walletShortfall` — ₹ the wallet is short of the full bill */
  walletShortfall?: number | null;
};

/** Circular crop + yellow fill — no white left/right bars from square asset */
function TokajoMark({ size = 56 }: { size?: number }) {
  const scale = 1.2;
  const offset = -((size * scale - size) / 2);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: TOKAJO_YELLOW,
      }}
    >
      <Image
        source={TOKAJO_LOGO}
        style={{
          width: size * scale,
          height: size * scale,
          marginLeft: offset,
          marginTop: offset,
        }}
        contentFit="cover"
      />
    </View>
  );
}

function SelectMark({ selected }: { selected: boolean }) {
  return selected ? (
    <CheckCircle2 color={ORANGE} fill={ORANGE} size={22} />
  ) : (
    <Circle color="#D1D5DB" size={22} />
  );
}

export function PaymentOptionsModal({
  visible,
  onClose,
  selectedMethod,
  onSelectMethod,
  itemCount,
  total,
  savings,
  restaurantName,
  deliveryTime,
  addressLabel,
  addressText,
  savedMethods,
  wallet,
  walletShortfall,
}: Props) {
  const router = useRouter();

  const savedCards = savedMethods?.filter((m) => m.type === 'card') || [];
  const savedUpis = savedMethods?.filter((m) => m.type === 'upi') || [];

  const handleWalletSelect = () => {
    if (walletShortfall != null && walletShortfall > 0) {
      Alert.alert(
        'Insufficient Balance',
        `Tokajo wallet must cover the full bill. You need ${formatInr(walletShortfall)} more.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Top Up Now',
            onPress: () => {
              onClose();
              router.push('/profile/wallet' as import('expo-router').Href);
            },
          },
        ]
      );
    } else {
      onSelectMethod('wallet');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView edges={['bottom']} style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.backButton} hitSlop={10}>
              <ArrowLeft color={TEXT} size={24} />
            </Pressable>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Payment Options</Text>
              <Text style={styles.headerSubtitle}>
                {itemCount} item{itemCount !== 1 ? 's' : ''} • Total: {formatInr(total)}
                {savings > 0 ? (
                  <>
                    {' • '}
                    <Text style={styles.savingsText}>
                      Savings of {formatInr(savings)}
                    </Text>
                  </>
                ) : null}
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.addressStrip}>
              <View style={styles.timeline}>
                <View style={styles.timelineDotTop} />
                <View style={styles.timelineLine} />
                <View style={styles.timelineDotBottom} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressRow} numberOfLines={1}>
                  <Text style={styles.addressName}>{restaurantName}</Text>
                  {deliveryTime ? (
                    <Text style={styles.addressDesc}>
                      {' '}
                      | Delivery in: {deliveryTime}
                    </Text>
                  ) : null}
                </Text>
                <Text style={styles.addressRow} numberOfLines={1}>
                  <Text style={styles.addressName}>{addressLabel}</Text>
                  <Text style={styles.addressDesc}> | {addressText}</Text>
                </Text>
              </View>
            </View>

            <LinearGradient
              colors={['#FB923C', '#F97316', '#EA580C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.upiPromo}
            >
              <View style={styles.upiPromoContent}>
                <Text style={styles.upiPromoTitle}>
                  Tokajo Foods Wallet
                </Text>
                <Text style={styles.upiPromoDesc}>
                  {wallet
                    ? `Balance ${formatInr(wallet.balance)} · pays the full bill`
                    : 'Pay the full bill with your Tokajo balance'}
                </Text>
                <Pressable
                  style={styles.upiPromoBtn}
                  onPress={handleWalletSelect}
                >
                  <Text style={styles.upiPromoBtnText}>
                    {wallet ? 'Pay with Wallet' : 'Open Wallet'}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.tokajoUpiMark}>
                <TokajoMark size={58} />
                <View style={styles.upiBadge}>
                  <Text style={styles.upiBadgeText}>WALLET</Text>
                </View>
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>UPI & wallets</Text>
            <View style={styles.cardGroup}>
              <Pressable
                style={styles.cardItem}
                onPress={() => onSelectMethod('paytm_upi')}
              >
                <View style={styles.cardRow}>
                  <View style={styles.paytmIconBox}>
                    <Image
                      source={PAYTM_LOGO}
                      style={styles.paytmImage}
                      contentFit="cover"
                    />
                  </View>
                  <View style={styles.cardItemBody}>
                    <Text style={styles.cardItemText}>Paytm UPI</Text>
                    <Text style={styles.cardItemSubtext}>Pay via Paytm</Text>
                  </View>
                  <SelectMark selected={selectedMethod === 'paytm_upi'} />
                </View>
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={styles.cardItem}
                onPress={() => onSelectMethod('gpay')}
              >
                <View style={styles.cardRow}>
                  <View style={styles.gpayIconBox}>
                    <Image
                      source={GPAY_LOGO}
                      style={styles.gpayImage}
                      contentFit="contain"
                    />
                  </View>
                  <View style={styles.cardItemBody}>
                    <Text style={styles.cardItemText}>Google Pay</Text>
                    <Text style={styles.cardItemSubtext}>UPI apps</Text>
                  </View>
                  <SelectMark selected={selectedMethod === 'gpay'} />
                </View>
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={styles.cardItem}
                onPress={() => onSelectMethod('phonepe')}
              >
                <View style={styles.cardRow}>
                  <View style={styles.phonepeIconBox}>
                    <Image
                      source={PHONEPE_LOGO}
                      style={styles.phonepeImage}
                      contentFit="cover"
                    />
                  </View>
                  <View style={styles.cardItemBody}>
                    <Text style={styles.cardItemText}>PhonePe</Text>
                    <Text style={styles.cardItemSubtext}>UPI apps</Text>
                  </View>
                  <SelectMark selected={selectedMethod === 'phonepe'} />
                </View>
              </Pressable>
            </View>

            {savedUpis.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Saved UPI IDs</Text>
                <View style={styles.cardGroup}>
                  {savedUpis.map((upi, index) => (
                    <View key={upi.id}>
                      <Pressable
                        style={styles.cardItem}
                        onPress={() => onSelectMethod(upi.id)}
                      >
                        <View style={styles.cardRow}>
                          <View style={[styles.iconBox, styles.iconBoxBorder]}>
                            <Text style={styles.upiTiny}>UPI</Text>
                          </View>
                          <View style={styles.cardItemBody}>
                            <Text style={styles.cardItemText}>{upi.upiId}</Text>
                            <Text style={styles.cardItemSubtext}>
                              Saved UPI ID
                            </Text>
                          </View>
                          <SelectMark selected={selectedMethod === upi.id} />
                        </View>
                      </Pressable>
                      {index < savedUpis.length - 1 ? (
                        <View style={styles.divider} />
                      ) : null}
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            <Text style={styles.sectionTitle}>Cards</Text>
            <View style={styles.cardGroup}>
              {savedCards.map((card) => (
                <View key={card.id}>
                  <Pressable
                    style={styles.cardItem}
                    onPress={() => onSelectMethod(card.id)}
                  >
                    <View style={styles.cardRow}>
                      <View style={[styles.iconBox, styles.iconBoxBorder]}>
                        <CreditCard color="#555" size={20} />
                      </View>
                      <View style={styles.cardItemBody}>
                        <Text style={styles.cardItemText}>
                          {card.brand ? card.brand.toUpperCase() : 'CARD'} ••••{' '}
                          {card.last4}
                        </Text>
                        <Text style={styles.cardItemSubtext}>
                          Expires {card.expiryMonth}/{card.expiryYear}
                        </Text>
                      </View>
                      <SelectMark selected={selectedMethod === card.id} />
                    </View>
                  </Pressable>
                  <View style={styles.divider} />
                </View>
              ))}
              <Pressable
                style={styles.cardItem}
                onPress={() => onSelectMethod('card')}
              >
                <View style={styles.cardRow}>
                  <View style={[styles.iconBox, styles.iconBoxBorder]}>
                    <Plus color={ORANGE} size={20} />
                  </View>
                  <View style={styles.cardItemBody}>
                    <Text style={[styles.cardItemText, { color: ORANGE }]}>
                      Add New Card
                    </Text>
                    <Text style={styles.cardItemSubtext}>
                      Save and Pay via Cards.
                    </Text>
                  </View>
                  <SelectMark selected={selectedMethod === 'card'} />
                </View>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>More options</Text>
            <View style={styles.cardGroup}>
              <Pressable
                style={styles.cardItem}
                onPress={() =>
                  Alert.alert(
                    'Pay later',
                    'Pay later is not available yet. Use UPI, card, netbanking, or pay on delivery.'
                  )
                }
              >
                <View style={styles.cardRow}>
                  <View style={[styles.iconBox, styles.iconBoxBorder]}>
                    <Receipt color="#555" size={18} />
                  </View>
                  <View style={styles.cardItemBody}>
                    <Text style={styles.cardItemText}>Pay Later</Text>
                    <Text style={styles.cardItemSubtext}>Not available yet</Text>
                  </View>
                  <ChevronRight color="#A0A0A0" size={20} />
                </View>
              </Pressable>
              <View style={styles.divider} />
              <Pressable
                style={styles.cardItem}
                onPress={() => onSelectMethod('netbanking')}
              >
                <View style={styles.cardRow}>
                  <View style={[styles.iconBox, styles.iconBoxBorder]}>
                    <Landmark color="#555" size={18} />
                  </View>
                  <View style={styles.cardItemBody}>
                    <Text style={styles.cardItemText}>Netbanking</Text>
                    <Text style={styles.cardItemSubtext}>
                      Opens Razorpay — pick your bank there
                    </Text>
                  </View>
                  <SelectMark selected={selectedMethod === 'netbanking'} />
                </View>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>Pay on Delivery</Text>
            <View style={styles.cardGroup}>
              <Pressable
                style={styles.cardItem}
                onPress={() => onSelectMethod('cod')}
              >
                <View style={styles.cardRow}>
                  <View style={[styles.iconBox, styles.iconBoxBorder]}>
                    <Truck color="#888" size={20} />
                  </View>
                  <View style={styles.cardItemBody}>
                    <Text style={styles.cardItemText}>
                      Pay on Delivery (Cash/UPI)
                    </Text>
                    <Text style={styles.cardItemSubtext}>
                      Pay with cash or UPI at your doorstep.
                    </Text>
                  </View>
                  <SelectMark selected={selectedMethod === 'cod'} />
                </View>
              </Pressable>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    color: TEXT,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: TEXT_SEC,
  },
  savingsText: {
    color: ORANGE,
    fontFamily: fonts.uiBold,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  addressStrip: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  timeline: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDotTop: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: ORANGE,
    backgroundColor: WHITE,
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: '#FED7AA',
    marginVertical: 2,
  },
  timelineDotBottom: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: ORANGE_DARK,
    backgroundColor: WHITE,
  },
  addressInfo: {
    flex: 1,
    gap: 12,
  },
  addressRow: {
    fontSize: 13,
  },
  addressName: {
    fontFamily: fonts.uiBold,
    color: TEXT,
  },
  addressDesc: {
    color: TEXT_SEC,
    fontFamily: fonts.ui,
  },
  upiPromo: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  upiPromoContent: {
    flex: 1,
    paddingRight: 16,
  },
  upiPromoTitle: {
    color: WHITE,
    fontSize: 15,
    fontFamily: fonts.displayBold,
    marginBottom: 4,
  },
  upiPromoDesc: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
    fontFamily: fonts.ui,
  },
  upiPromoBtn: {
    backgroundColor: WHITE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  upiPromoBtnText: {
    color: ORANGE,
    fontFamily: fonts.uiBold,
    fontSize: 12,
  },
  tokajoUpiMark: {
    alignItems: 'center',
    gap: 6,
  },
  upiBadge: {
    backgroundColor: WHITE,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  upiBadgeText: {
    color: ORANGE,
    fontSize: 10,
    fontFamily: fonts.uiBold,
  },
  paytmIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#00BAF2',
  },
  paytmImage: {
    width: 40,
    height: 40,
  },
  gpayIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpayImage: {
    width: 28,
    height: 28,
  },
  phonepeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#5F259F',
  },
  phonepeImage: {
    width: 40,
    height: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: fonts.uiBold,
    color: TEXT_SEC,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  cardGroup: {
    backgroundColor: WHITE,
    borderRadius: 14,
    marginHorizontal: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  iconBoxBorder: {
    borderColor: BORDER,
  },
  upiTiny: {
    fontSize: 10,
    fontFamily: fonts.uiBold,
    color: ORANGE,
  },
  cardItemBody: {
    flex: 1,
  },
  cardItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardItemText: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.uiSemi,
    color: TEXT,
  },
  cardItemSubtext: {
    fontSize: 12,
    color: TEXT_SEC,
    marginTop: 2,
    fontFamily: fonts.ui,
  },
  newBadge: {
    backgroundColor: ORANGE,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  newBadgeText: {
    color: WHITE,
    fontSize: 9,
    fontFamily: fonts.uiBold,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 68,
  },
});
