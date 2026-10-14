import { useEffect, useState } from "react";

/**
 * A simple countdown hook.
 * @param initialSeconds  Starting value in seconds.
 * @returns [remaining, restart]
 */
export function useCountdown(initialSeconds = 0) {
  const [remaining, setRemaining] = useState(initialSeconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const restart = (seconds?: number) =>
    setRemaining(seconds ?? initialSeconds);

  return [remaining, restart] as const;
}