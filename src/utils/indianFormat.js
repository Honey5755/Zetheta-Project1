/**
 * Indian number-system formatting helpers (Spec C3.3).
 *
 * Indian grouping places the first comma after three digits and every two
 * digits thereafter — e.g. 1050000 -> "10,50,000" (NOT "1,050,000"). We rely on
 * the platform Intl implementation with the `en-IN` locale.
 */

const groupFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * Format a number with Indian digit grouping (no currency symbol).
 * @param {number | string} value
 * @returns {string} e.g. "10,50,000"; empty string for non-finite input.
 */
export function formatIndianNumber(value) {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return groupFormatter.format(Math.round(n));
}

/**
 * Format a number as INR currency with Indian grouping.
 * @param {number | string} value
 * @returns {string} e.g. "₹10,50,000"; empty string for non-finite input.
 */
export function formatINR(value) {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return currencyFormatter.format(Math.round(n));
}

/**
 * Strip formatting and return the numeric value of a currency string.
 * @param {number | string | null | undefined} input
 * @returns {number | ''} the parsed integer, or '' when there are no digits.
 */
export function parseAmount(input) {
  if (typeof input === 'number') return input;
  const digits = String(input ?? '').replace(/[^0-9]/g, '');
  return digits === '' ? '' : Number(digits);
}
