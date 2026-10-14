# VoxBook: Resilient Audiobook Generation Pipeline

[![CI](https://github.com/M-NOVA288/Vox-book-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/M-NOVA288/Vox-book-engine/actions/workflows/ci.yml)

A React + TypeScript app that turns a manuscript into audiobook chapters. The focus is the
**generation pipeline**: what happens when the text-to-speech provider is slow, rate-limits you,
returns errors or goes down entirely.

> **Scope:** the UI (library, player, creator dashboard, paywall) is a front-end prototype with mock
> account and payout data. The speech provider is **simulated** (`FakeSpeechProvider`) so failures can be
> injected on demand. The pipeline itself (queue, retries, timeouts, circuit breaker, dead-letter list)
> is real code with tests.

## The problem

A 30-chapter book means 30 calls to a speech API. Real providers return random 5xx errors, throttle
with 429 + `Retry-After`, occasionally hang, and sometimes go down for minutes. A naive loop either
fails the whole book on the first error or retries in a tight loop and makes the outage worse.

## How the pipeline handles it

```
manuscript ─► splitIntoChapters ─► JobQueue (concurrency 3) ─► withTimeout(5s) ─► speech provider
                                     │  idempotent job ids          │
                                     │                              ├─ success  → breaker.onSuccess, record latency
                                     │                              └─ failure  → breaker.onFailure
                                     │                                   ├─ 4xx (permanent)       → dead-letter
                                     │                                   ├─ retryable, attempts left → jittered backoff
                                     │                                   │                          (≥ Retry-After on 429)
                                     │                                   └─ out of attempts        → dead-letter
                                     └─ circuit open → job waits for cooldown without spending an attempt
```

| Concern | Technique | Code |
|---|---|---|
| Transient failures | Retry with exponential backoff and **full jitter** (avoids a synchronized retry storm when the provider recovers) | [`retry.ts`](src/pipeline/retry.ts) |
| Hung calls | Per-attempt deadline; a stuck call frees its worker after 5 s | [`errors.ts`](src/pipeline/errors.ts) |
| Retry only what can succeed | 429, 5xx and timeouts retry; 4xx goes straight to dead-letter | [`errors.ts`](src/pipeline/errors.ts) |
| Rate limits | Honors `Retry-After` from 429 responses | [`queue.ts`](src/pipeline/queue.ts) |
| Outages | **Circuit breaker** (closed → open → half-open): stops calling a dead provider, sends one trial call after cooldown; queued jobs pause instead of burning their retries | [`circuitBreaker.ts`](src/pipeline/circuitBreaker.ts) |
| Overload | Bounded concurrency (3 calls in flight) | [`queue.ts`](src/pipeline/queue.ts) |
| Duplicate work | Idempotent job ids (`bookId:chapterIndex`): enqueueing twice never calls the provider twice | [`queue.ts`](src/pipeline/queue.ts) |
| Poison jobs | **Dead-letter list** with manual requeue after the cause is fixed | [`queue.ts`](src/pipeline/queue.ts) |
| Visibility | Metrics: attempts, retries, failures, short-circuits, dead-letters, p50/p95 latency | [`queue.ts`](src/pipeline/queue.ts) |

## Reliability Lab (try it)

The **Reliability** tab in the app is a fault-injection console. Turn on random 500s, rate limits,
added latency, hanging calls or a full outage, upload a `.txt` manuscript in the Player view, and watch
retries, the circuit breaker state, latency percentiles and the dead-letter list update live.

## Tests

15 tests in [`tests/pipeline.test.ts`](tests/pipeline.test.ts), run in CI on every push:

- retries recover from transient 5xx; permanent 4xx is not retried
- a hung call is cut off by the timeout and retried
- 429 waits at least `Retry-After`
- jobs that keep failing are dead-lettered after `maxAttempts`, then succeed on requeue
- the concurrency limit is never exceeded
- circuit breaker opens, half-opens with exactly one trial call, closes on success, re-opens on a failed trial
- **outage scenario:** provider down, then recovers; every chapter still completes, nothing is dead-lettered, and the breaker shed load during the outage
- backoff growth, cap and jitter; chapter splitting

```bash
npm install
npm test          # pipeline tests
npm run dev       # http://localhost:5173
npm run build
```

## Project layout

```
src/
  pipeline/         queue, retry policy, circuit breaker, timeouts, fake provider, chapter splitter
  components/       UI (library, player, dashboard, Reliability Lab, paywall)
  App.tsx           wires uploads into the pipeline
tests/              pipeline tests
```

## Limits and next steps

- **In-memory queue.** Jobs live in the browser tab; a refresh loses them. Production would move the queue server-side (e.g. a database-backed queue or SQS/Pub/Sub) with workers, so work survives restarts.
- **Simulated provider.** Swapping in a real TTS API means implementing one `synthesize(text)` function; the retry/breaker logic doesn't change.
- **Per-provider rate budgets.** Concurrency is a fixed number; a token bucket sized to the provider's quota would use capacity more precisely.
- **Only `.txt`/`.md` are parsed.** Other formats fall back to placeholder chapters.
