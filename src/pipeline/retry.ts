export interface RetryPolicy {
  /** Total tries including the first one. */
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY: RetryPolicy = { maxAttempts: 4, baseDelayMs: 250, maxDelayMs: 8000 };

/**
 * Exponential backoff with "full jitter": a random delay between 0 and
 * min(maxDelay, base * 2^(attempt-1)).
 *
 * Without jitter, every job that failed during an outage retries at the same instant when the
 * provider recovers, and that synchronized burst can knock it over again (thundering herd).
 */
export function backoffDelay(attempt: number, policy: RetryPolicy, random: () => number = Math.random): number {
  const ceiling = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** Math.max(0, attempt - 1));
  return Math.floor(random() * ceiling);
}
