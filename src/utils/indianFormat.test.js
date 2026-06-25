import { describe, it, expect } from 'vitest';
import { formatIndianNumber, formatINR, parseAmount } from './indianFormat.js';

describe('indianFormat', () => {
  it('groups digits in the Indian number system', () => {
    expect(formatIndianNumber(1050000)).toBe('10,50,000');
    expect(formatIndianNumber(50000)).toBe('50,000');
    expect(formatIndianNumber(10000000)).toBe('1,00,00,000');
  });

  it('returns an empty string for non-finite input', () => {
    expect(formatIndianNumber('')).toBe('');
    expect(formatIndianNumber(NaN)).toBe('');
  });

  it('formats INR currency with the rupee symbol and Indian grouping', () => {
    const result = formatINR(1050000);
    expect(result).toContain('10,50,000');
    expect(result).toMatch(/₹|INR/);
  });

  it('parses formatted amounts back to a number', () => {
    expect(parseAmount('₹10,50,000')).toBe(1050000);
    expect(parseAmount('2,00,000')).toBe(200000);
    expect(parseAmount(50000)).toBe(50000);
    expect(parseAmount('')).toBe('');
  });
});
