import { describe, expect, it } from 'vitest';
import { clean, escapeXml, looksLikeBot, validateContact } from './validate';

describe('validateContact', () => {
  it('accepts a normal message and normalises the email', () => {
    const r = validateContact({ name: ' Aminata ', email: 'A@Example.org', message: 'I would like to volunteer.' });
    expect(r.ok).toBe(true);
    if (r.ok) { expect(r.value.name).toBe('Aminata'); expect(r.value.email).toBe('a@example.org'); }
  });
  it('rejects short names, bad emails and tiny messages', () => {
    expect(validateContact({ name: 'A', email: 'a@b.co', message: 'long enough message' }).ok).toBe(false);
    expect(validateContact({ name: 'Ama', email: 'not-an-email', message: 'long enough message' }).ok).toBe(false);
    expect(validateContact({ name: 'Ama', email: 'a@b.co', message: 'short' }).ok).toBe(false);
  });
  it('caps overlong input and rejects non-strings', () => {
    expect(clean('x'.repeat(5000), 100)).toHaveLength(100);
    expect(clean({ a: 1 }, 10)).toBe('');
  });
  it('strips control characters', () => {
    expect(clean('hi\u0000there\u0007', 50)).toBe('hithere');
  });
});

describe('looksLikeBot', () => {
  it('flags a filled honeypot', () => expect(looksLikeBot({ website: 'http://spam' })).toBe(true));
  it('flags instant submissions', () => expect(looksLikeBot({ website: '', elapsedMs: 300 })).toBe(true));
  it('passes a human-paced submission', () => expect(looksLikeBot({ website: '', elapsedMs: 15000 })).toBe(false));
});

describe('escapeXml', () => {
  it('escapes markup characters', () => expect(escapeXml('a&b<c>"d\'')).toBe('a&amp;b&lt;c&gt;&quot;d&apos;'));
});
