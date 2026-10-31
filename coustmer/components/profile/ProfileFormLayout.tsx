import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthMessageBanner } from '@/components/auth/AuthMessageBanner';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { APP_BOTTOM_NAV_INSET } from '@/components/navigation/AppBottomNav';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  banner?: { message: string; type: 'error' | 'success' } | null;
  onSave?: () => void;
  saveLabel?: string;
  saving?: boolean;
  saveDisabled?: boolean;
  backFallback?: string;
  scrollable?: boolean;
};

export function ProfileFormLayout({
  title,
  subtitle,
  children,
  banner,
  onSave,
  saveLabel = 'Save changes',
  saving,
  saveDisabled,
  backFallback,
  scrollable = true,
}: Props) {
  const main = (
    <>
      {banner ? <AuthMessageBanner message={banner.message} type={banner.type} /> : null}
      {children}
      {onSave ? (
        <Pressable
          style={[styles.saveButton, (saving || saveDisabled) && styles.saveDisabled]}
          onPress={onSave}
          disabled={saving || saveDisabled}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveText}>{saveLabel}</Text>
          )}
        </Pressable>
      ) : null}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <ScreenHeader title={title} subtitle={subtitle} backFallback={backFallback} />
        {scrollable ? (
          <ScrollView
            style={styles.flex}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
            contentContainerStyle={styles.scroll}
          >
            {main}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.scroll]}>{main}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: authTheme.bg,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  scroll: {
    paddingBottom: 24 + APP_BOTTOM_NAV_INSET,
    paddingTop: 4,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: authTheme.brand,
    borderRadius: 14,
    minHeight: 52,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
