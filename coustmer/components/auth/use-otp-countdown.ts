import { useEffect, useState } from 'react';

function remainingSeconds(endsAtMs: number | null): number {
  if (!endsAtMs) return 0;
  return Math.max(0, Math.ceil((endsAtMs - Date.now()) / 1000));
}

export function formatOtpClock(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

/** Live countdown for OTP validity / resend cooldown. */
export function useOtpCountdown(endsAtMs: number | null) {
  const [secondsLeft, setSecondsLeft] = useState(() => remainingSeconds(endsAtMs));

  useEffect(() => {
    setSecondsLeft(remainingSeconds(endsAtMs));
    if (!endsAtMs) return;
    const id = setInterval(() => {
      setSecondsLeft(remainingSeconds(endsAtMs));
    }, 250);
    return () => clearInterval(id);
  }, [endsAtMs]);

  return {
    secondsLeft,
    expired: Boolean(endsAtMs) && secondsLeft <= 0,
    active: Boolean(endsAtMs) && secondsLeft > 0,
  };
}
