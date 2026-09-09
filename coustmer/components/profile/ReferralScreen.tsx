import { Pressable } from '@/components/common/Pressable';
import { Copy, Gift } from 'lucide-react-native';
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { AuthInput } from '@/components/auth/AuthInput';
import { ErrorView, LoadingView } from '@/components/common/StateViews';
import { ProfileFormLayout } from '@/components/profile/ProfileFormLayout';
import { authTheme } from '@/constants/auth-theme';
import { useApplyReferral, useReferral } from '@/lib/profile/hooks';

export function ReferralScreen() {
  const { data, isLoading, isError, error, refetch } = useReferral();
  const applyReferral = useApplyReferral();

  const [code, setCode] = useState('');
  const [banner, setBanner] = useState<{
    message: string;
    type: 'error' | 'success';
  } | null>(null);

  const copyCode = async () => {
    if (!data?.referralCode) return;
    await Share.share({
      message: `Use my Tokajo code ${data.referralCode} when you sign up — we both get wallet credit!`,
    });
    setBanner({ message: 'Referral code shared!', type: 'success' });
  };

  const handleApply = () => {
    if (data?.hasApplied) {
      setBanner({ message: 'You already used a referral code', type: 'error' });
      return;
    }
    if (!code.trim()) {
      setBanner({ message: 'Enter a referral code', type: 'error' });
      return;
    }

    setBanner(null);
    applyReferral.mutate(
      { code: code.trim() },
      {
        onSuccess: (message) => {
          setCode('');
          setBanner({ message, type: 'success' });
          void refetch();
        },
        onError: (err) =>
          setBanner({
            message: err instanceof Error ? err.message : 'Invalid referral code',
            type: 'error',
          }),
      }
    );
  };

  const program = data?.program;
  const showApply = !data?.hasApplied;

  return (
    <ProfileFormLayout
      title="Refer & earn"
      subtitle="Share your code — both of you get Tokajo wallet credit once"
      banner={banner}
      onSave={showApply ? handleApply : undefined}
      saveLabel={
        applyReferral.isPending
          ? 'Applying…'
          : showApply
            ? 'Apply referral code'
            : undefined
      }
      saving={applyReferral.isPending}
    >
      {isLoading ? (
        <LoadingView label="Loading referral info…" />
      ) : isError ? (
        <ErrorView
          message={error instanceof Error ? error.message : 'Failed to load'}
          onRetry={refetch}
        />
      ) : (
        <View style={styles.codeCard}>
          <Gift color={authTheme.brand} size={28} />
          <Text style={styles.codeLabel}>Your referral code</Text>
          <Text style={styles.codeValue}>{data?.referralCode ?? '—'}</Text>
          <Text style={styles.codeMeta}>
            {data?.referralCount ?? 0} successful referrals
            {program?.maxReferralsPerUser && program.maxReferralsPerUser > 0
              ? ` · ${program.referralsRemaining ?? 0} left (max ${program.maxReferralsPerUser})`
              : ''}
          </Text>
          {program?.isActive ? (
            <Text style={styles.rewardMeta}>
              You get ₹{program.referrerBonusInr} · Friend gets ₹
              {program.refereeBonusInr} (one time)
            </Text>
          ) : (
            <Text style={styles.rewardMeta}>Program currently paused</Text>
          )}
          <Pressable style={styles.copyButton} onPress={copyCode}>
            <Copy color="#FFFFFF" size={16} />
            <Text style={styles.copyText}>Share code</Text>
          </Pressable>
        </View>
      )}

      {showApply ? (
        <AuthInput
          label="Have a referral code?"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          placeholder="Enter code"
          autoCapitalize="characters"
        />
      ) : (
        <Text style={styles.appliedNote}>
          You already joined with a referral — wallet credit is one-time only.
        </Text>
      )}
    </ProfileFormLayout>
  );
}

const styles = StyleSheet.create({
  codeCard: {
    alignItems: 'center',
    backgroundColor: authTheme.brandSoft,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: authTheme.brandMuted,
    padding: 28,
    marginBottom: 20,
  },
  codeLabel: {
    color: authTheme.textMuted,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  codeValue: {
    color: authTheme.brand,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 6,
  },
  codeMeta: {
    color: authTheme.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  rewardMeta: {
    color: authTheme.textMuted,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: authTheme.brand,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  copyText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  appliedNote: {
    color: authTheme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
