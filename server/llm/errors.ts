/** Raised when the model replies with something we cannot turn into a result. */
export class LlmResponseError extends Error {
  readonly raw: string;

  constructor(message: string, raw: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'LlmResponseError';
    this.raw = raw;
  }

  /** Truncated raw text, safe to put in a log line. */
  get rawPreview(): string {
    return this.raw.length > 300 ? `${this.raw.slice(0, 300)}…` : this.raw;
  }
}
