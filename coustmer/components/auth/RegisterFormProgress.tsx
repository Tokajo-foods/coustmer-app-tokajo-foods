import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { RegisterStep } from '@/components/auth/register-form-helpers';
import { registerFormStyles as styles } from '@/components/auth/register-form-styles';
import { authTheme } from '@/constants/auth-theme';

const PHASES = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'details', label: 'Account' },
] as const;

function phaseIndex(step: RegisterStep): number {
  if (step === 'email' || step === 'email_otp') return 0;
  if (step === 'phone' || step === 'phone_otp') return 1;
  return 2;
}

export function RegisterFormProgress({ step }: { step: RegisterStep }) {
  const idx = phaseIndex(step);

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        {PHASES.map((phase, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <View
              key={phase.key}
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
        {PHASES.map((phase, i) => (
          <Text
            key={phase.key}
            style={[
              styles.progressLabel,
              i === 0 && styles.progressLabelFirst,
              i === 2 && styles.progressLabelLast,
              i <= idx && styles.progressLabelOn,
            ]}
          >
            {phase.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
