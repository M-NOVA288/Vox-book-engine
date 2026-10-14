import { CircuitBreaker } from './circuitBreaker';
import { isRetryable, ProviderError, withTimeout } from './errors';
import { backoffDelay, DEFAULT_RETRY, type RetryPolicy } from './retry';

export type JobStatus = 'queued' | 'running' | 'retry_wait' | 'succeeded' | 'dead';

export interface Job<TIn, TOut> {
  /** Idempotency key: enqueueing the same id twice returns the existing job instead of doing the work twice. */
  id: string;
  input: TIn;
  status: JobStatus;
  attempts: number;
  lastError?: string;
  result?: TOut;
  enqueuedAt: number;
  finishedAt?: number;
}

export interface QueueMetrics {
  enqueued: number;
  succeeded: number;
  deadLettered: number;
  attempts: number;
  failedAttempts: number;
  retries: number;
  shortCircuited: number;
  inFlight: number;
  queued: number;
  p50Ms: number | null;
  p95Ms: number | null;
}

export interface QueueOptions {
  /** Max jobs calling the provider at once: protects the provider and our rate limit. */
  concurrency?: number;
  retry?: RetryPolicy;
  /** Per-attempt deadline. */
  timeoutMs?: number;
  breaker?: CircuitBreaker;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
  random?: () => number;
  /** Called after every state change, e.g. to re-render a progress bar. */
  onChange?: () => void;
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function percentile(sorted: number[], p: number): number | null {
  if (!sorted.length) return null;
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
}

/**
 * In-process job queue for chapter generation with bounded concurrency, per-attempt timeouts,
 * retries with jittered backoff, a circuit breaker and a dead-letter list.
 *
 * Failure handling, in order:
 *  1. breaker open        -> wait for cooldown WITHOUT spending an attempt (jobs pause during an outage)
 *  2. attempt fails       -> retryable? back off and retry, honoring Retry-After on 429
 *  3. attempts exhausted  -> job moves to the dead-letter list for inspection / manual requeue
 *     or non-retryable
 */
export class JobQueue<TIn, TOut> {
  private jobs = new Map<string, Job<TIn, TOut>>();
  private pending: string[] = [];
  private running = 0;
  private latencies: number[] = [];
  private idleWaiters: (() => void)[] = [];
  private m = { enqueued: 0, succeeded: 0, deadLettered: 0, attempts: 0, failedAttempts: 0, retries: 0, shortCircuited: 0 };

  private readonly handler: (input: TIn) => Promise<TOut>;
  private readonly concurrency: number;
  private readonly retry: RetryPolicy;
  private readonly timeoutMs: number;
  readonly breaker: CircuitBreaker;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly now: () => number;
  private readonly random: () => number;
  private readonly onChange: () => void;

  constructor(handler: (input: TIn) => Promise<TOut>, opts: QueueOptions = {}) {
    this.handler = handler;
    this.concurrency = opts.concurrency ?? 2;
    this.retry = opts.retry ?? DEFAULT_RETRY;
    this.timeoutMs = opts.timeoutMs ?? 10_000;
    this.breaker = opts.breaker ?? new CircuitBreaker();
    this.sleep = opts.sleep ?? realSleep;
    this.now = opts.now ?? Date.now;
    this.random = opts.random ?? Math.random;
    this.onChange = opts.onChange ?? (() => {});
  }

  enqueue(id: string, input: TIn): Job<TIn, TOut> {
    const existing = this.jobs.get(id);
    if (existing) return existing;
    const job: Job<TIn, TOut> = { id, input, status: 'queued', attempts: 0, enqueuedAt: this.now() };
    this.jobs.set(id, job);
    this.pending.push(id);
    this.m.enqueued += 1;
    this.changed();
    this.pump();
    return job;
  }

  /** Manually retry a dead-lettered job (after fixing the cause). */
  requeue(id: string): boolean {
    const job = this.jobs.get(id);
    if (!job || job.status !== 'dead') return false;
    job.status = 'queued';
    job.attempts = 0;
    job.lastError = undefined;
    this.m.deadLettered -= 1;
    this.pending.push(id);
    this.changed();
    this.pump();
    return true;
  }

  get(id: string) { return this.jobs.get(id); }
  list() { return [...this.jobs.values()]; }
  deadLetters() { return this.list().filter((j) => j.status === 'dead'); }

  metrics(): QueueMetrics {
    const sorted = [...this.latencies].sort((a, b) => a - b);
    return {
      ...this.m,
      inFlight: this.running,
      queued: this.pending.length,
      p50Ms: percentile(sorted, 50),
      p95Ms: percentile(sorted, 95),
    };
  }

  /** Resolves when nothing is queued or running. */
  drain(): Promise<void> {
    if (this.isIdle()) return Promise.resolve();
    return new Promise((resolve) => this.idleWaiters.push(resolve));
  }

  private isIdle() {
    return this.running === 0 && this.pending.length === 0;
  }

  private changed() {
    try { this.onChange(); } catch { /* a UI callback must never break the queue */ }
  }

  private pump() {
    while (this.running < this.concurrency && this.pending.length) {
      const job = this.jobs.get(this.pending.shift()!)!;
      this.running += 1;
      void this.run(job).finally(() => {
        this.running -= 1;
        this.changed();
        this.pump();
        if (this.isIdle()) this.idleWaiters.splice(0).forEach((r) => r());
      });
    }
  }

  private async run(job: Job<TIn, TOut>) {
    while (true) {
      // 1. Circuit breaker: don't hammer a provider that is down; wait without burning an attempt.
      if (!this.breaker.tryAcquire()) {
        this.m.shortCircuited += 1;
        job.status = 'retry_wait';
        this.changed();
        await this.sleep(Math.max(50, this.breaker.retryInMs()));
        continue;
      }

      job.status = 'running';
      job.attempts += 1;
      this.m.attempts += 1;
      this.changed();
      const start = this.now();

      try {
        job.result = await withTimeout(this.timeoutMs, () => this.handler(job.input));
        this.breaker.onSuccess();
        this.latencies.push(this.now() - start);
        if (this.latencies.length > 500) this.latencies.shift();
        job.status = 'succeeded';
        job.finishedAt = this.now();
        this.m.succeeded += 1;
        this.changed();
        return;
      } catch (err) {
        this.breaker.onFailure();
        this.m.failedAttempts += 1;
        job.lastError = err instanceof Error ? `${err.name}: ${err.message}` : String(err);

        // 3. Give up: permanent error or out of attempts -> dead-letter.
        if (!isRetryable(err) || job.attempts >= this.retry.maxAttempts) {
          job.status = 'dead';
          job.finishedAt = this.now();
          this.m.deadLettered += 1;
          this.changed();
          return;
        }

        // 2. Back off, honoring the provider's Retry-After on rate limits.
        this.m.retries += 1;
        job.status = 'retry_wait';
        this.changed();
        const hinted = err instanceof ProviderError && err.retryAfterMs ? err.retryAfterMs : 0;
        await this.sleep(Math.max(hinted, backoffDelay(job.attempts, this.retry, this.random)));
      }
    }
  }
}
