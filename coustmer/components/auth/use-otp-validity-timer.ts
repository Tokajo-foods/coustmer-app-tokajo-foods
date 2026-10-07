import { useEffect, useState } from 'react';

export function formatOtpClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Counts down from `durationSeconds` every 1s while `active`.
 * `resetKey` changes (e.g. each OTP send) restart the timer.
 */
export function useOtpCountdown(
  active: boolean,
  durationSeconds: number,
  resetKey: number,
) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!active || durationSeconds <= 0) {
      setRemaining(0);
      return;
    }

    setRemaining(durationSeconds);
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [active, durationSeconds, resetKey]);

  return remaining;
}

/** @deprecated prefer useOtpCountdown — kept for cooldown end timestamps */
export function useOtpValidityTimer(endsAtMs: number | null) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endsAtMs) {
      setRemaining(0);
      return;
    }

    const tick = () => {
      setRemaining(Math.max(0, Math.ceil((endsAtMs - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAtMs]);

  return remaining;
}
