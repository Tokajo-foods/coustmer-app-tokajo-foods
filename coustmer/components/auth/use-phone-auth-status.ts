import { useEffect, useState } from 'react';

import { AuthApiError } from '@/lib/auth/http';
import { phoneAuthApi } from '@/lib/auth/phone-auth-api';

const DEFAULT_COOLDOWN_SECONDS = 30;

/** `GET /auth/phone/status` — `serverReady` stays null while loading or when the check itself fails. */
export function usePhoneAuthStatus(enabled: boolean) {
  const [serverReady, setServerReady] = useState<boolean | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(DEFAULT_COOLDOWN_SECONDS);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    phoneAuthApi
      .status()
      .then((status) => {
        if (cancelled) return;
        setServerReady(status.firebaseConfigured);
        if (status.resendCooldownSeconds > 0) setCooldownSeconds(status.resendCooldownSeconds);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof AuthApiError && error.code === 'FIREBASE_NOT_CONFIGURED') {
          setServerReady(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { serverReady, cooldownSeconds };
}
