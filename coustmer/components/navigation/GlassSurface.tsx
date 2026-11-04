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
  /** Strong frosted glass — floating bottom tab bar. */
  translucent?: boolean;
};

function GlassLayers({ radius, translucent }: { radius: number; translucent: boolean }) {
  const hasBlur = NativeBlur != null;

  if (!translucent) {
    return (
      <>
        {NativeBlur ? (
          <NativeBlur
            intensity={Platform.OS === 'ios' ? 75 : 50}
            tint={Platform.OS === 'ios' ? 'systemUltraThinMaterialLight' : 'light'}
            experimentalBlurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: hasBlur ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.9)' },
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
        <View pointerEvents="none" style={[styles.rim, { borderRadius: radius }]} />
      </>
    );
  }

  const fill = hasBlur ? 0.1 : 0.48;
  const blurIntensity = Platform.OS === 'ios' ? 92 : 64;
  const blurTint = Platform.OS === 'ios' ? 'systemThinMaterialLight' : 'light';

  return (
    <>
      {NativeBlur ? (
        <NativeBlur
          intensity={blurIntensity}
          tint={blurTint}
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(255,255,255,${fill})` }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)', 'rgba(255,255,255,0.04)']}
        locations={[0, 0.45, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0.06)', 'transparent']}
        locations={[0, 0.35, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0.08)', 'transparent']}
        locations={[0, 0.12, 0.45]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.glassSpecular}
      />
      <View
        pointerEvents="none"
        style={[styles.rim, styles.rimGlass, { borderRadius: radius }]}
      />
    </>
  );
}

export function GlassSurface({ radius, style, children, translucent = false }: Props) {
  return (
    <View
      style={[
        translucent ? styles.shadowGlass : styles.shadow,
        { borderRadius: radius },
        style,
      ]}
    >
      <View style={[styles.clip, { borderRadius: radius }]}>
        <GlassLayers radius={radius} translucent={translucent} />
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
  shadowGlass: {
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 2 },
      default: {
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
      },
    }),
  },
  clip: {
    overflow: 'hidden',
  },
  glassSpecular: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '38%',
  },
  rim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderBottomColor: 'rgba(255,255,255,0.25)',
  },
  rimGlass: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(255,255,255,0.55)',
    borderTopColor: 'rgba(255,255,255,0.75)',
    borderBottomColor: 'rgba(15,23,42,0.06)',
  },
});
