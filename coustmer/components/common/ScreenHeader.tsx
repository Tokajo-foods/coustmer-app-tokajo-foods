import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { SmoothPressable } from '@/components/common/SmoothPressable';
import { authTheme } from '@/constants/auth-theme';
import { navigateBack } from '@/lib/motion/navigate-back';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  /** Fallback route when there is no history (default `/home`). */
  backFallback?: string;
};

export function ScreenHeader({
  title,
  subtitle,
  left,
  right,
  backFallback = '/home',
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {left !== undefined ? (
        left
      ) : (
        <SmoothPressable
          onPress={() => navigateBack(router, backFallback)}
          style={styles.backButton}
          hitSlop={10}
          pressScale={0.9}
          accessibilityLabel="Go back"
        >
          <ChevronLeft color={authTheme.text} size={22} />
        </SmoothPressable>
      )}
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: '#02060C',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#686B78',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  spacer: {
    width: 40,
  },
});
