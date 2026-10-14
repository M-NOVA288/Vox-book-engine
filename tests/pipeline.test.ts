import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JobQueue } from '../src/pipeline/queue';
import { CircuitBreaker } from '../src/pipeline/circuitBreaker';
import { backoffDelay, DEFAULT_RETRY } from '../src/pipeline/retry';
import { isRetryable, ProviderError, TimeoutError, withTimeout } from '../src/pipeline/errors';
import { FakeSpeechProvider } from '../src/pipeline/fakeSpeechProvider';
import { splitIntoChapters } from '../src/pipeline/chapters';

const fast = { retry: { maxAttempts: 4, baseDelayMs: 1, maxDelayMs: 5 }, timeoutMs: 200 };
const text = 'Call me Ishmael. Some years ago, never mind how long precisely.';

test('happy path: every chapter succeeds on the first attempt', async () => {
  const provider = new FakeSpeechProvider({ latencyMs: 1 });
  const q = new JobQueue((t: string) => provider.synthesize(t), fast);
  for (let i = 0; i < 5; i++) q.enqueue(`book1:${i}`, text);
  await q.drain();
  const m = q.metrics();
  assert.equal(m.succeeded, 5);
  assert.equal(m.retries, 0);
  assert.equal(m.deadLettered, 0);
});

test('enqueue is idempotent: the same job id is never processed twice', async () => {
  const provider = new FakeSpeechProvider({ latencyMs: 1 });
  const q = new JobQueue((t: string) => provider.synthesize(t), fast);
  const a = q.enqueue('book1:0', text);
  const b = q.enqueue('book1:0', text);
  await q.drain();
  assert.equal(a, b);
  assert.equal(provider.calls, 1);
});

test('transient 5xx errors are retried until they succeed', async () => {
  let n = 0;
  const flaky = async () => {
    n += 1;
    if (n < 3) throw new ProviderError('internal error', 500);
    return 'ok';
  };
  const q = new JobQueue(flaky, fast);
  q.enqueue('j', null);
  await q.drain();
  assert.equal(q.get('j')!.status, 'succeeded');
  assert.equal(q.get('j')!.attempts, 3);
  assert.equal(q.metrics().retries, 2);
});

test('permanent 4xx errors go straight to the dead-letter list (no wasted retries)', async () => {
  const provider = new FakeSpeechProvider({ latencyMs: 1 });
  const q = new JobQueue((t: string) => provider.synthesize(t), fast);
  q.enqueue('empty', '   ');
  await q.drain();
  const job = q.get('empty')!;
  assert.equal(job.status, 'dead');
  assert.equal(job.attempts, 1);
  assert.match(job.lastError!, /400|empty/);
});

test('jobs that keep failing are dead-lettered after maxAttempts, and can be requeued', async () => {
  let failing = true;
  const q = new JobQueue(async () => { if (failing) throw new ProviderError('down', 503); return 'ok'; },
    { ...fast, breaker: new CircuitBreaker({ failureThreshold: 100 }) });
  q.enqueue('j', null);
  await q.drain();
  assert.equal(q.get('j')!.status, 'dead');
  assert.equal(q.get('j')!.attempts, 4);

  failing = false;
  assert.equal(q.requeue('j'), true);
  await q.drain();
  assert.equal(q.get('j')!.status, 'succeeded');
  assert.equal(q.metrics().deadLettered, 0);
});

test('a hung provider call is cut off by the per-attempt timeout and retried', async () => {
  let n = 0;
  const q = new JobQueue(async () => {
    n += 1;
    if (n === 1) await new Promise((r) => setTimeout(r, 1000)); // hangs past the 50ms timeout
    return 'ok';
  }, { ...fast, timeoutMs: 50 });
  const start = Date.now();
  q.enqueue('j', null);
  await q.drain();
  assert.equal(q.get('j')!.status, 'succeeded');
  assert.ok(Date.now() - start < 900, 'did not wait for the hung call');
});

test('rate limits (429) are retried and Retry-After is respected', async () => {
  const waits: number[] = [];
  let n = 0;
  const q = new JobQueue(async () => {
    n += 1;
    if (n === 1) throw new ProviderError('rate limited', 429, 120);
    return 'ok';
  }, { ...fast, sleep: async (ms) => { waits.push(ms); } });
  q.enqueue('j', null);
  await q.drain();
  assert.equal(q.get('j')!.status, 'succeeded');
  assert.ok(waits[0] >= 120, `waited ${waits[0]}ms, expected >= Retry-After`);
});

test('concurrency limit is never exceeded', async () => {
  let active = 0, peak = 0;
  const q = new JobQueue(async () => {
    active += 1; peak = Math.max(peak, active);
    await new Promise((r) => setTimeout(r, 5));
    active -= 1;
    return 'ok';
  }, { ...fast, concurrency: 3 });
  for (let i = 0; i < 12; i++) q.enqueue(`j${i}`, null);
  await q.drain();
  assert.equal(peak, 3);
  assert.equal(q.metrics().succeeded, 12);
});

test('circuit breaker: opens after repeated failures, then half-opens and closes on recovery', () => {
  let t = 0;
  const b = new CircuitBreaker({ failureThreshold: 3, cooldownMs: 1000, now: () => t });
  for (let i = 0; i < 3; i++) { assert.ok(b.tryAcquire()); b.onFailure(); }
  assert.equal(b.state, 'open');
  assert.equal(b.tryAcquire(), false, 'open breaker short-circuits calls');

  t = 1000;
  assert.equal(b.state, 'half_open');
  assert.equal(b.tryAcquire(), true, 'one trial call allowed');
  assert.equal(b.tryAcquire(), false, 'only one trial at a time');
  b.onSuccess();
  assert.equal(b.state, 'closed');
});

test('circuit breaker: a failed trial re-opens it', () => {
  let t = 0;
  const b = new CircuitBreaker({ failureThreshold: 1, cooldownMs: 100, now: () => t });
  b.tryAcquire(); b.onFailure();
  t = 100;
  b.tryAcquire(); b.onFailure();
  assert.equal(b.state, 'open');
});

test('during an outage jobs pause instead of burning retries, then finish after recovery', async () => {
  const provider = new FakeSpeechProvider({ latencyMs: 1, outage: true });
  const breaker = new CircuitBreaker({ failureThreshold: 2, cooldownMs: 30 });
  const q = new JobQueue((t: string) => provider.synthesize(t), { ...fast, retry: { maxAttempts: 6, baseDelayMs: 1, maxDelayMs: 5 }, breaker });
  for (let i = 0; i < 4; i++) q.enqueue(`b:${i}`, text);
  setTimeout(() => { provider.settings.outage = false; }, 120); // provider recovers
  await q.drain();
  const m = q.metrics();
  assert.equal(m.succeeded, 4, 'all chapters eventually generated');
  assert.equal(m.deadLettered, 0);
  assert.ok(m.shortCircuited > 0, 'breaker shed load while the provider was down');
});

test('backoff grows exponentially, is capped, and is jittered', () => {
  const p = DEFAULT_RETRY;
  assert.equal(backoffDelay(1, p, () => 0.999), 249);
  assert.equal(backoffDelay(3, p, () => 0.999), 999);
  assert.equal(backoffDelay(20, p, () => 0.999), Math.floor(0.999 * p.maxDelayMs), "capped at maxDelayMs");
  assert.equal(backoffDelay(3, p, () => 0), 0);
});

test('retry classification', () => {
  assert.equal(isRetryable(new ProviderError('x', 500)), true);
  assert.equal(isRetryable(new ProviderError('x', 503)), true);
  assert.equal(isRetryable(new ProviderError('x', 429)), true);
  assert.equal(isRetryable(new ProviderError('x', 400)), false);
  assert.equal(isRetryable(new ProviderError('x', 401)), false);
  assert.equal(isRetryable(new TimeoutError(10)), true);
});

test('withTimeout rejects slow work and passes fast work through', async () => {
  await assert.rejects(withTimeout(10, () => new Promise((r) => setTimeout(r, 200))), TimeoutError);
  assert.equal(await withTimeout(100, async () => 7), 7);
});

test('chapter splitting: headings when present, word chunks otherwise', () => {
  const book = 'Chapter 1\nIt was a dark night.\nChapter 2\nThe end came quickly.';
  const ch = splitIntoChapters(book);
  assert.equal(ch.length, 2);
  assert.equal(ch[0].title, 'Chapter 1');
  assert.equal(ch[1].text, 'The end came quickly.');

  const plain = Array.from({ length: 4500 }, (_, i) => `w${i}`).join(' ');
  assert.equal(splitIntoChapters(plain, 2000).length, 3);
  assert.deepEqual(splitIntoChapters('   '), []);
});
