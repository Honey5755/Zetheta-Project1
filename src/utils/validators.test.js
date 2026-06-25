import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  isValidPanFormat,
  isPanEntityAllowed,
  panErrorMessage,
  verhoeffValidate,
  verhoeffGenerate,
  isValidAadhaar,
} from './validators.js';

describe('Verhoeff checksum (Spec C3.2)', () => {
  it('matches the standard reference check digits', () => {
    expect(verhoeffGenerate('236')).toBe(3);
    expect(verhoeffValidate('2363')).toBe(true);
    expect(verhoeffGenerate('142857')).toBe(0);
    expect(verhoeffValidate('1428570')).toBe(true);
  });

  it('rejects numbers with a bad check digit', () => {
    expect(verhoeffValidate('1428575')).toBe(false);
    expect(verhoeffValidate('2364')).toBe(false);
  });
});

describe('isValidAadhaar', () => {
  it('accepts a 12-digit Verhoeff-valid number not starting 0/1', () => {
    expect(isValidAadhaar('234123412346')).toBe(true);
  });

  it('rejects wrong length, leading 0/1, or bad checksum', () => {
    expect(isValidAadhaar('23412341234')).toBe(false); // 11 digits
    expect(isValidAadhaar('034123412346')).toBe(false); // leading 0
    expect(isValidAadhaar('234123412345')).toBe(false); // bad checksum
  });
});

describe('PAN validation (Spec C3.1)', () => {
  it('validates the AAAAA9999A format', () => {
    expect(isValidPanFormat('ABCPE1234F')).toBe(true);
    expect(isValidPanFormat('ABC1234567')).toBe(false);
  });

  it('enforces entity type by loan type', () => {
    expect(isPanEntityAllowed('ABCPE1234F', 'personal')).toBe(true); // P = individual
    expect(isPanEntityAllowed('ABCCE1234F', 'personal')).toBe(false); // C not allowed
    expect(isPanEntityAllowed('ABCCE1234F', 'business')).toBe(true); // C allowed for business
  });

  it('gives a specific message for an invalid 4th character', () => {
    expect(panErrorMessage('ABCDE1234F', 'personal')).toMatch(/4th character must be P/i);
    expect(panErrorMessage('ABCPE1234F', 'personal')).toBeNull();
  });
});

describe('calculateAge boundary (Spec E3.4)', () => {
  it('returns null for empty/invalid input', () => {
    expect(calculateAge('')).toBeNull();
    expect(calculateAge('not-a-date')).toBeNull();
  });
});
