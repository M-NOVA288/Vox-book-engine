/** Error from the speech provider, carrying the HTTP-style status it returned. */
export class ProviderError extends Error {
  readonly status: number;
  readonly retryAfterMs?: number;
  constructor(message: string, status: number, retryAfterMs?: number) {
    super(message);
    this.name = 'ProviderError';
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Retry only what can succeed on a second try:
 * timeouts, rate limits (429) and server errors (5xx). A 4xx means the request itself is bad
 * (e.g. empty chapter text), so retrying would just waste capacity.
 */
export function isRetryable(err: unknown): boolean {
  if (err instanceof TimeoutError) return true;
  if (err instanceof ProviderError) return err.status === 429 || err.status >= 500;
  return true; // unknown errors (network resets etc.) are treated as transient
}

/** Runs fn with a hard deadline so a hung dependency can't hold a worker forever. */
export async function withTimeout<T>(ms: number, fn: () => Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
