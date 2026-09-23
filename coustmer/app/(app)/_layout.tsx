import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { ReplaceCartModal } from '@/components/order/ReplaceCartModal';
import { authTheme } from '@/constants/auth-theme';
import {
  PREMIUM_FADE_OPTIONS,
  PREMIUM_STACK_OPTIONS,
} from '@/lib/motion/premium';
import { useAuthStore } from '@/store/auth-store';

export default function AppLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!isHydrated) {
    return <AuthLoadingScreen />;
  }

  if (!token || !user) {
    return <Redirect href="/?auth=login" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: authTheme.bg }}>
      <Stack
        screenOptions={{
          ...PREMIUM_STACK_OPTIONS,
          contentStyle: { backgroundColor: authTheme.bg },
        }}
      >
        <Stack.Screen
          name="search"
          options={{
            ...PREMIUM_FADE_OPTIONS,
            presentation: 'transparentModal',
          }}
        />
      </Stack>
      <AppBottomNav />
      <ReplaceCartModal />
    </View>
  );
}
