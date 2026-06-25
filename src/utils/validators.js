/**
 * Pure validation helpers shared across Zod schemas (Spec C3.1, C3.2).
 *
 * This module grows over the project; Day 3 adds age calculation and the name
 * rule, Day 4 adds PAN / Aadhaar (Verhoeff) / GST.
 */

/** Letters, spaces and periods only; must start with a letter (Spec B2.1). */
export const NAME_PATTERN = /^[A-Za-z][A-Za-z. ]*$/;

/** Indian mobile: 10 digits starting 6–9 (Spec B2.1). */
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;

/**
 * Whole years between `dob` and today, precise to the day (Spec E3.4 — a person
 * who is 20 years 364 days old must read as 20, not 21).
 *
 * @param {string | Date | null | undefined} dob  ISO date string or Date.
 * @returns {number | null} age in completed years, or null for invalid input.
 */
export function calculateAge(dob) {
  if (!dob) return null;
  const birth = dob instanceof Date ? dob : new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}
