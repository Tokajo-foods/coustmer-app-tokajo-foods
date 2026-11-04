import { Pressable } from '@/components/common/Pressable';
import { MapPin, Plus, Star, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ActivityIndicator,
  Alert,
  FlatList,
  
  RefreshControl,
  StyleSheet,
  Text,
  View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/common/ScreenHeader';
import {
  EmptyView,
  ErrorView,
  LoadingView,
} from '@/components/common/StateViews';
import { authTheme } from '@/constants/auth-theme';
import {
  useDeleteAddress,
  useSavedAddresses,
  useSetDefaultAddress,
} from '@/lib/address/hooks';
import type { SavedAddress } from '@/lib/address/types';
import { formatAddressLabel, savedAddressTagLabel } from '@/lib/address/types';
import {
  extractCityFromAddress,
  normalizeCityName,
} from '@/lib/location/format';
import { useDeliveryLocationStore } from '@/store/delivery-location-store';

export function SavedAddressesScreen() {
  const router = useRouter();
  const setDeliveryLocation = useDeliveryLocationStore((s) => s.setLocation);
  const activeId = useDeliveryLocationStore((s) => s.location?.savedAddressId);

  const list = useSavedAddresses();
  const remove = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const applyAsDelivery = (address: SavedAddress) => {
    const displayLabel = savedAddressTagLabel(address);
    setDeliveryLocation({
      label: displayLabel,
      formattedAddress: address.formattedAddress,
      city: normalizeCityName(
        address.city || extractCityFromAddress(address.formattedAddress)
      ),
      lat: address.lat,
      lng: address.lng,
      source: 'saved',
      savedAddressId: address.id,
      updatedAt: Date.now(),
    });
    Alert.alert('Delivery address updated', `${displayLabel} is now active.`);
  };

  const handleDefault = async (address: SavedAddress) => {
    try {
      await setDefault.mutateAsync(address.id);
      applyAsDelivery(address);
    } catch (e) {
      Alert.alert(
        'Could not set default',
        e instanceof Error ? e.message : 'Try again'
      );
    }
  };

  const handleDelete = (address: SavedAddress) => {
    Alert.alert(
      'Delete address?',
      `Remove ${formatAddressLabel(address.label)}?`,
      [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove.mutateAsync(address.id);
          } catch (e) {
            Alert.alert(
              'Could not delete',
              e instanceof Error ? e.message : 'Try again'
            );
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.pad}>
        <ScreenHeader
          title="Saved addresses"
          subtitle="Home, work & delivery pins"
          right={
            <Pressable
              style={styles.addBtn}
              onPress={() => router.push('/profile/addresses/new')}
            >
              <Plus color="#FFFFFF" size={18} strokeWidth={2.5} />
            </Pressable>
          }
        />
      </View>

      {list.isLoading ? (
        <LoadingView label="Loading addresses…" />
      ) : list.isError ? (
        <ErrorView
          message={
            list.error instanceof Error
              ? list.error.message
              : 'Failed to load addresses'
          }
          onRetry={list.refetch}
        />
      ) : (
        <FlatList
          data={list.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={list.isRefetching}
              onRefresh={list.refetch}
              tintColor={authTheme.brand}
            />
          }
          ListEmptyComponent={
            <EmptyView
              icon={<MapPin color={authTheme.textDim} size={40} />}
              title="No saved addresses"
              subtitle="Add Home or Work so checkout is faster next time."
            />
          }
          renderItem={({ item }) => {
            const isActive = activeId === item.id;
            return (
              <Pressable
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => applyAsDelivery(item)}
                onLongPress={() =>
                  router.push({
                    pathname: '/profile/addresses/[addressId]',
                    params: { addressId: item.id },
                  })
                }
              >
                <View style={styles.cardTop}>
                  <View style={styles.labelPill}>
                    <Text style={styles.labelText}>
                      {savedAddressTagLabel(item)}
                    </Text>
                  </View>
                  {item.isDefault ? (
                    <View style={styles.defaultPill}>
                      <Star color="#FFFFFF" fill="#FFFFFF" size={10} />
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  ) : null}
                  {isActive ? (
                    <Text style={styles.activeText}>In use</Text>
                  ) : null}
                </View>

                <Text style={styles.address} numberOfLines={3}>
                  {item.formattedAddress ||
                    [item.street, item.area, item.city, item.pincode]
                      .filter(Boolean)
                      .join(', ') ||
                    'Address on map'}
                </Text>
                {item.city || item.pincode ? (
                  <Text style={styles.meta}>
                    {[item.city, item.pincode].filter(Boolean).join(' · ')}
                  </Text>
                ) : null}

                <View style={styles.actions}>
                  {!item.isDefault ? (
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => handleDefault(item)}
                      disabled={setDefault.isPending}
                    >
                      {setDefault.isPending ? (
                        <ActivityIndicator size="small" color={authTheme.brand} />
                      ) : (
                        <Text style={styles.actionText}>Set default</Text>
                      )}
                    </Pressable>
                  ) : null}
                  <Pressable
                    style={styles.actionBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/profile/addresses/[addressId]',
                        params: { addressId: item.id },
                      })
                    }
                  >
                    <Text style={styles.actionText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(item)}
                  >
                    <Trash2 color={authTheme.error} size={14} />
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: authTheme.bg },
  pad: { paddingHorizontal: 16, paddingTop: 4 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: authTheme.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: 16, paddingBottom: 40, gap: 12, flexGrow: 1 },
  card: {
    backgroundColor: authTheme.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
    padding: 14,
    gap: 8,
  },
  cardActive: {
    borderColor: authTheme.brand,
    backgroundColor: authTheme.brandSoft,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  labelPill: {
    backgroundColor: authTheme.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
  },
  labelText: {
    color: authTheme.text,
    fontSize: 12,
    fontWeight: '800',
  },
  defaultPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  activeText: {
    marginLeft: 'auto',
    color: authTheme.brand,
    fontSize: 12,
    fontWeight: '700',
  },
  address: {
    color: authTheme.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  meta: {
    color: authTheme.textMuted,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: authTheme.surface,
    borderWidth: 1,
    borderColor: authTheme.cardBorder,
  },
  actionText: {
    color: authTheme.brand,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    marginLeft: 'auto',
  },
  deleteText: {
    color: authTheme.error,
    fontSize: 12,
    fontWeight: '700',
  },
});
