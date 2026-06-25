/**
 * Pure validation helpers shared across Zod schemas (Spec C3.1, C3.2).
 */

/** Letters, spaces and periods only; must start with a letter (Spec B2.1). */
export const NAME_PATTERN = /^[A-Za-z][A-Za-z. ]*$/;

/** Indian mobile: 10 digits starting 6–9 (Spec B2.1). */
export const MOBILE_PATTERN = /^[6-9]\d{9}$/;

/** PAN: 5 letters, 4 digits, 1 letter (Spec C3.1). */
export const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** GST: 2-digit state code + 10-char PAN + entity digit + 'Z' + checksum (Spec Day 6). */
export const GST_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]$/;

/** PAN 4th-character entity types (Spec C3.1). */
export const PAN_ENTITY_TYPES = {
  P: 'Individual',
  C: 'Company',
  H: 'HUF',
  A: 'Association of Persons',
  B: 'Body of Individuals',
  G: 'Government',
  J: 'Artificial Juridical Person',
  L: 'Local Authority',
  F: 'Firm',
  T: 'Trust',
};

/**
 * Whole years between `dob` and today, precise to the day (Spec E3.4 — a person
 * who is 20 years 364 days old must read as 20, not 21).
 *
 * @param {string | Date | null | undefined} dob
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

/** @param {string} value @returns {boolean} */
export const isValidPanFormat = (value) => PAN_PATTERN.test(value);

/** The entity-type character (4th) of a well-formed PAN, else null. */
export const panEntityChar = (value) => (isValidPanFormat(value) ? value[3] : null);

/**
 * Whether a PAN's entity type is acceptable for the given loan type
 * (Spec C3.1: personal/home accept only Individual 'P'; business accepts
 * P, Company 'C', or Firm 'F').
 */
export function isPanEntityAllowed(value, loanType) {
  const entity = panEntityChar(value);
  if (!entity) return false;
  if (loanType === 'business') return ['P', 'C', 'F'].includes(entity);
  return entity === 'P';
}

/**
 * Contextual PAN error message, or null when the PAN is acceptable
 * (Spec 3.3.3 — error suggests a correction).
 */
export function panErrorMessage(value, loanType) {
  if (!isValidPanFormat(value)) {
    return 'PAN must be 10 characters in the format AAAAA9999A.';
  }
  if (!isPanEntityAllowed(value, loanType)) {
    return loanType === 'business'
      ? 'For a business loan the PAN 4th character must indicate an Individual (P), Company (C) or Firm (F).'
      : 'For this loan the PAN must belong to an individual (4th character must be P).';
  }
  return null;
}

// --- Aadhaar / Verhoeff checksum (Spec C3.2) -------------------------------

// Verhoeff multiplication table (d), permutation table (p) and inverse (inv).
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Verhoeff checksum validation: the checksum across all digits is 0 for a
 * valid number (the trailing digit is the check digit). (Spec C3.2)
 * @param {string} num  digit string
 * @returns {boolean}
 */
export function verhoeffValidate(num) {
  if (!/^\d+$/.test(num)) return false;
  let checksum = 0;
  const digits = num.split('').reverse();
  for (let i = 0; i < digits.length; i += 1) {
    checksum = VERHOEFF_D[checksum][VERHOEFF_P[i % 8][Number(digits[i])]];
  }
  return checksum === 0;
}

/**
 * Compute the Verhoeff check digit for a base number (used to generate valid
 * Aadhaar values for tests/fixtures). (Spec C3.2)
 * @param {string} num  digit string without the check digit
 * @returns {number}
 */
export function verhoeffGenerate(num) {
  let checksum = 0;
  const digits = `${num}0`.split('').reverse();
  for (let i = 0; i < digits.length; i += 1) {
    checksum = VERHOEFF_D[checksum][VERHOEFF_P[i % 8][Number(digits[i])]];
  }
  return VERHOEFF_D[checksum].indexOf(0);
}

/**
 * Valid Aadhaar: 12 digits, not starting 0 or 1, passing the Verhoeff checksum.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidAadhaar(value) {
  if (!/^\d{12}$/.test(value)) return false;
  if (value[0] === '0' || value[0] === '1') return false;
  return verhoeffValidate(value);
}
