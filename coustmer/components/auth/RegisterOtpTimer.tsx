import { Clock3 } from 'lucide-react-native';
import { Text, View } from 'react-native';

import {
  formatOtpClock,
  useOtpValidityTimer,
} from '@/components/auth/use-otp-validity-timer';
import { registerFormStyles as styles } from '@/components/auth/register-form-styles';
import { authTheme } from '@/constants/auth-theme';

type Props = {
  channel: 'email' | 'phone';
  expiresAtMs: number | null;
  totalExpiresSeconds: number;
};

export function RegisterOtpTimer({ channel, expiresAtMs, totalExpiresSeconds }: Props) {
  const remaining = useOtpValidityTimer(expiresAtMs);
  const expired = Boolean(expiresAtMs) && remaining <= 0;
  const total = Math.max(totalExpiresSeconds, 1);
  const progress = expired ? 0 : Math.min(1, remaining / total);
  const urgent = !expired && remaining > 0 && remaining <= 60;

  return (
    <View style={[styles.otpTimerCard, expired && styles.otpTimerCardExpired, urgent && styles.otpTimerCardUrgent]}>
      <View style={styles.otpTimerTop}>
        <View style={styles.otpTimerIconWrap}>
          <Clock3
            color={expired ? authTheme.error : urgent ? authTheme.brandDark : authTheme.brand}
            size={15}
            strokeWidth={2.3}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.otpTimerLabel}>
            {expired
              ? 'Code expired'
              : channel === 'email'
                ? 'Email code valid for'
                : 'Phone code valid for'}
          </Text>
          <Text
            style={[
              styles.otpTimerValue,
              expired && styles.otpTimerValueExpired,
              urgent && styles.otpTimerValueUrgent,
            ]}
          >
            {expired ? '0:00' : formatOtpClock(remaining)}
          </Text>
        </View>
      </View>
      <View style={styles.otpTimerTrack}>
        <View
          style={[
            styles.otpTimerFill,
            { width: `${Math.round(progress * 100)}%` },
            expired && styles.otpTimerFillExpired,
            urgent && styles.otpTimerFillUrgent,
          ]}
        />
      </View>
      <Text style={styles.otpTimerHint}>
        {expired
          ? 'Request a new code to continue verification.'
          : 'Enter the 6-digit code before the timer runs out.'}
      </Text>
    </View>
  );
}
