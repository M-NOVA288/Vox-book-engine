import { ProviderError } from './errors';

export interface ProviderSettings {
  /** Probability (0-1) that a call fails with a 500. */
  failureRate: number;
  /** Simulated processing time per call. */
  latencyMs: number;
  /** Every Nth call returns 429 with Retry-After (0 = off). */
  rateLimitEvery: number;
  /** Hard outage: every call fails with 503. */
  outage: boolean;
  /** Calls hang this long before answering (to trigger timeouts); 0 = off. */
  hangMs: number;
}

export interface SpeechResult {
  audioSeconds: number;
  words: number;
}

/**
 * Stand-in for a text-to-speech API with fault injection, so the pipeline's failure handling
 * can be exercised on purpose (in tests and from the Reliability Lab screen).
 * Real providers fail in exactly these ways: random 5xx, 429 rate limits, outages, hangs.
 */
export class FakeSpeechProvider {
  settings: ProviderSettings;
  calls = 0;
  private readonly random: () => number;

  constructor(settings: Partial<ProviderSettings> = {}, random: () => number = Math.random) {
    this.settings = { failureRate: 0, latencyMs: 300, rateLimitEvery: 0, outage: false, hangMs: 0, ...settings };
    this.random = random;
  }

  async synthesize(text: string): Promise<SpeechResult> {
    this.calls += 1;
    const s = this.settings;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (words === 0) throw new ProviderError('empty text', 400);

    await new Promise((r) => setTimeout(r, s.hangMs || s.latencyMs));

    if (s.outage) throw new ProviderError('service unavailable', 503);
    if (s.rateLimitEvery > 0 && this.calls % s.rateLimitEvery === 0) throw new ProviderError('rate limited', 429, 200);
    if (this.random() < s.failureRate) throw new ProviderError('internal error', 500);

    // ~150 spoken words per minute
    return { words, audioSeconds: Math.round((words / 150) * 60) };
  }
}
