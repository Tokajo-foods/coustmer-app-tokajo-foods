import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';

import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { AppBottomNav } from '@/components/navigation/AppBottomNav';
import { ReplaceCartModal } from '@/components/order/ReplaceCartModal';
import { authTheme } from '@/constants/auth-theme';
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
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: authTheme.bg },
        }}
      >
        <Stack.Screen
          name="search"
          options={{
            animation: 'fade',
            presentation: 'transparentModal',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        />
      </Stack>
      <AppBottomNav />
      <ReplaceCartModal />
    </View>
  );
}
