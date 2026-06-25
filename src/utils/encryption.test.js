import { describe, it, expect } from 'vitest';
import { encryptJSON, decryptJSON, decryptString } from './encryption.js';

describe('encryption (AES-256-GCM, Spec C3.4)', () => {
  it('round-trips a JSON value', async () => {
    const data = { loanType: 'home', pan: 'ABCPE1234F', loanAmount: 2500000 };
    const cipher = await encryptJSON(data);
    expect(typeof cipher).toBe('string');
    expect(cipher).not.toContain('ABCPE1234F'); // PII not in plaintext
    const restored = await decryptJSON(cipher);
    expect(restored).toEqual(data);
  });

  it('produces different ciphertext each time (random IV)', async () => {
    const a = await encryptJSON({ x: 1 });
    const b = await encryptJSON({ x: 1 });
    expect(a).not.toBe(b);
  });

  it('fails to decrypt tampered ciphertext (GCM auth)', async () => {
    const cipher = await encryptJSON({ secret: 'value' });
    const tampered = `${cipher.slice(0, -4)}AAAA`;
    await expect(decryptString(tampered)).rejects.toBeDefined();
  });
});
