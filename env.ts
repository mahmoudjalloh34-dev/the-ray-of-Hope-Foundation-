// Reads a runtime environment variable the Netlify way, with a fallback for local unit tests.
declare const Netlify: { env: { get(key: string): string | undefined } } | undefined;

export function env(key: string): string | undefined {
  try {
    if (typeof Netlify !== 'undefined' && Netlify) return Netlify.env.get(key);
  } catch {
    /* fall through to process.env */
  }
  return process.env[key];
}
