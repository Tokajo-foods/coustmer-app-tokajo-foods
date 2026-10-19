import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Pressable } from '@/components/common/Pressable';
import { hubStyles } from '@/components/notification/notifications-hub-styles';
import { authTheme } from '@/constants/auth-theme';

/** Inbox placeholder for guests: notifications belong to an account. */
export function SignedOutInbox() {
  const router = useRouter();
  return (
    <View style={hubStyles.emptyContainer}>
      <View style={hubStyles.emptyIconWrap}>
        <Bell color={authTheme.brand} size={32} strokeWidth={2} />
      </View>
      <Text style={hubStyles.emptyTitle}>Sign in to see notifications</Text>
      <Text style={hubStyles.emptySubtitle}>
        Order updates, refunds and offers for your account appear here.
      </Text>
      <Pressable style={styles.button} onPress={() => router.push('/?auth=login' as never)}>
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: authTheme.brand,
  },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
