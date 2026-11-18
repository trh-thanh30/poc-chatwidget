import { useCallback, useEffect, useRef, useState } from 'react';

const COOLDOWN_TICK_MS = 1_000;

export function useRateLimitCooldown(scope: unknown) {
  const deadlineRef = useRef(0);
  const [cooldownVersion, setCooldownVersion] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const start = useCallback((retryAfterSeconds: number) => {
    const durationSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
    deadlineRef.current = Date.now() + durationSeconds * 1_000;
    setRemainingSeconds(durationSeconds);
    setCooldownVersion((version) => version + 1);
  }, []);

  const isBlockedNow = useCallback(() => deadlineRef.current > Date.now(), []);

  useEffect(() => {
    deadlineRef.current = 0;
    setRemainingSeconds(0);
  }, [scope]);

  useEffect(() => {
    if (!deadlineRef.current) return;

    const updateRemainingTime = () => {
      const nextRemaining = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1_000),
      );
      setRemainingSeconds(nextRemaining);
      if (nextRemaining === 0) {
        deadlineRef.current = 0;
        window.clearInterval(timer);
      }
    };
    const timer = window.setInterval(updateRemainingTime, COOLDOWN_TICK_MS);
    return () => window.clearInterval(timer);
  }, [cooldownVersion, scope]);

  return {
    isActive: remainingSeconds > 0,
    isBlockedNow,
    remainingSeconds,
    start,
  };
}
