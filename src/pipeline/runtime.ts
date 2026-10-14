import { useSyncExternalStore } from 'react';
import { CircuitBreaker } from './circuitBreaker';
import { FakeSpeechProvider, type SpeechResult } from './fakeSpeechProvider';
import { JobQueue } from './queue';

/**
 * The app-wide generation pipeline: one provider, one breaker, one queue.
 * React components subscribe to it through usePipeline().
 */
export interface ChapterJob {
  bookId: string;
  index: number;
  title: string;
  text: string;
}

const listeners = new Set<() => void>();
let version = 0;
const notify = () => {
  version += 1;
  listeners.forEach((l) => l());
};

export const provider = new FakeSpeechProvider({ latencyMs: 400 });
export const breaker = new CircuitBreaker({ failureThreshold: 5, cooldownMs: 8000 });
export const queue = new JobQueue<ChapterJob, SpeechResult>((job) => provider.synthesize(job.text), {
  concurrency: 3,
  timeoutMs: 5000,
  breaker,
  onChange: notify,
});

/** Lets the Reliability Lab change fault injection and re-render. */
export function updateProvider(patch: Partial<typeof provider.settings>) {
  provider.settings = { ...provider.settings, ...patch };
  notify();
}

export function usePipeline() {
  useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => version,
  );
  return { queue, breaker, provider, metrics: queue.metrics(), jobs: queue.list(), state: breaker.state };
}
