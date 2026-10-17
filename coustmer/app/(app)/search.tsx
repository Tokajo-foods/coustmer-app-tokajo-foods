import { SearchScreen } from '@/components/search/SearchScreen';
import { Stack } from 'expo-router';

export default function SearchPage() {
  return (
    <>
      <Stack.Screen
        options={{
          animation: 'none',
          presentation: 'transparentModal',
          gestureEnabled: false,
          contentStyle: { backgroundColor: 'transparent' },
          headerShown: false,
        }}
      />
      <SearchScreen />
    </>
  );
}
