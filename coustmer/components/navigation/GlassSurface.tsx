import { requireOptionalNativeModule } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentType, ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type BlurProps = {
  intensity?: number;
  tint?: string;
  experimentalBlurMethod?: 'none' | 'dimezisBlurView';
  style?: StyleProp<ViewStyle>;
};

/** Older dev clients without the ExpoBlurView native view fall back to a frosted tint. */
const NativeBlur: ComponentType<BlurProps> | null = (() => {
  if (Platform.OS === 'web') return require('expo-blur').BlurView;
  if (!requireOptionalNativeModule('ExpoBlurView')) return null;
  return require('expo-blur').BlurView;
})();

type Props = {
  radius: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

export function GlassSurface({ radius, style, children }: Props) {
  const hasBlur = NativeBlur != null;

  return (
    <View style={[styles.shadow, { borderRadius: radius }, style]}>
      <View style={[styles.clip, { borderRadius: radius }]}>
        {NativeBlur ? (
          <NativeBlur
            intensity={Platform.OS === 'ios' ? 55 : 32}
            tint={Platform.OS === 'ios' ? 'systemUltraThinMaterialLight' : 'light'}
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: hasBlur ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.62)' },
          ]}
        />
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.18)']}
          locations={[0, 0.55, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="none"
          style={[styles.rim, { borderRadius: radius }]}
        />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#1F2937',
        shadowOpacity: 0.16,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 12 },
      },
      android: { elevation: 0 },
      default: {
        boxShadow: '0 12px 32px rgba(31,41,55,0.16)',
      },
    }),
  },
  clip: {
    overflow: 'hidden',
  },
  rim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderBottomColor: 'rgba(255,255,255,0.25)',
  },
});
