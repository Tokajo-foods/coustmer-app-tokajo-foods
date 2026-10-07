import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { forgotPasswordStyles as styles } from '@/components/auth/forgot-password-styles';
import type { ForgotStep } from '@/components/auth/forgot-password-types';
import { authTheme } from '@/constants/auth-theme';

const STEP_ORDER: Array<'email' | 'otp' | 'password'> = ['email', 'otp', 'password'];
const STEP_LABELS = ['Email', 'Verify', 'Password'] as const;

export function ForgotStepIndicator({ step }: { step: ForgotStep }) {
  if (step === 'done') return null;
  const idx = STEP_ORDER.indexOf(step as 'email' | 'otp' | 'password');

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        {STEP_ORDER.map((key, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <View
              key={key}
              style={{ flexDirection: 'row', alignItems: 'center', flex: i < 2 ? 1 : 0 }}
            >
              <View
                style={[
                  styles.progressNode,
                  active && styles.progressNodeActive,
                  done && styles.progressNodeDone,
                ]}
              >
                {done ? (
                  <Check color={authTheme.brand} size={14} strokeWidth={3} />
                ) : (
                  <Text style={[styles.progressNum, active && styles.progressNumOn]}>{i + 1}</Text>
                )}
              </View>
              {i < 2 ? (
                <View style={[styles.progressLine, i < idx && styles.progressLineOn]} />
              ) : null}
            </View>
          );
        })}
      </View>
      <View style={styles.progressLabels}>
        {STEP_LABELS.map((label, i) => (
          <Text
            key={label}
            style={[
              styles.progressLabel,
              i === 0 && styles.progressLabelFirst,
              i === 2 && styles.progressLabelLast,
              i <= idx && styles.progressLabelOn,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}
