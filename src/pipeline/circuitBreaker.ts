export type CircuitState = 'closed' | 'open' | 'half_open';

export interface CircuitBreakerOptions {
  /** Consecutive failures that trip the breaker. */
  failureThreshold?: number;
  /** How long to stop calling the provider before testing it again. */
  cooldownMs?: number;
  now?: () => number;
}

/**
 * Stops calling a dependency that is clearly down.
 *
 * closed     normal; failures are counted
 * open       every call is short-circuited until the cooldown passes (no load on a sick provider)
 * half_open  one trial call is allowed; success closes the breaker, failure re-opens it
 */
export class CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  private trialInFlight = false;
  private _state: CircuitState = 'closed';
  readonly failureThreshold: number;
  readonly cooldownMs: number;
  private readonly now: () => number;

  constructor(opts: CircuitBreakerOptions = {}) {
    this.failureThreshold = opts.failureThreshold ?? 5;
    this.cooldownMs = opts.cooldownMs ?? 10_000;
    this.now = opts.now ?? Date.now;
  }

  get state(): CircuitState {
    if (this._state === 'open' && this.now() - this.openedAt >= this.cooldownMs) this._state = 'half_open';
    return this._state;
  }

  /** Ms until a call may be attempted again (0 if allowed now). */
  retryInMs(): number {
    const s = this.state;
    if (s === 'closed') return 0;
    if (s === 'half_open') return this.trialInFlight ? 100 : 0;
    return Math.max(0, this.cooldownMs - (this.now() - this.openedAt));
  }

  /** Ask before each call. Returns false if the call should not be made right now. */
  tryAcquire(): boolean {
    const s = this.state;
    if (s === 'closed') return true;
    if (s === 'half_open' && !this.trialInFlight) {
      this.trialInFlight = true;
      return true;
    }
    return false;
  }

  onSuccess() {
    this.failures = 0;
    this.trialInFlight = false;
    this._state = 'closed';
  }

  onFailure() {
    this.trialInFlight = false;
    if (this._state === 'half_open') return this.trip();
    this.failures += 1;
    if (this.failures >= this.failureThreshold) this.trip();
  }

  private trip() {
    this._state = 'open';
    this.openedAt = this.now();
    this.failures = 0;
  }
}
