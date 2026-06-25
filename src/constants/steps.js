import { requiresCoApplicant } from './loanProducts.js';

/**
 * Ordered registry of the 8 wizard steps (Spec B2.1).
 *
 * Each entry is metadata only — the Wizard maps `key` to a lazily-loaded
 * component. `conditional: true` marks a step whose visibility depends on
 * accumulated form data (currently only the Co-Applicant step).
 *
 * @typedef {Object} StepDef
 * @property {string} key         Stable identifier (used for navigation + URLs).
 * @property {number} number      1-based step number from the spec.
 * @property {string} title       Full title shown as the step heading.
 * @property {string} shortTitle  Compact label for the progress indicator.
 * @property {boolean} [conditional]
 */

/** @type {StepDef[]} */
export const STEP_DEFS = Object.freeze([
  {
    key: 'loan-type', number: 1, title: 'Loan Type & Basic Information', shortTitle: 'Loan',
  },
  {
    key: 'personal', number: 2, title: 'Personal Information', shortTitle: 'Personal',
  },
  {
    key: 'kyc', number: 3, title: 'Identity Verification (KYC)', shortTitle: 'KYC',
  },
  {
    key: 'address', number: 4, title: 'Address Information', shortTitle: 'Address',
  },
  {
    key: 'employment', number: 5, title: 'Employment & Income', shortTitle: 'Income',
  },
  {
    key: 'co-applicant',
    number: 6,
    title: 'Co-Applicant & Guarantor',
    shortTitle: 'Co-App',
    conditional: true,
  },
  {
    key: 'documents', number: 7, title: 'Documents & E-Signature', shortTitle: 'Documents',
  },
  {
    key: 'review', number: 8, title: 'Review & Submit', shortTitle: 'Review',
  },
]);

/** @param {string} key @returns {StepDef | undefined} */
export const getStepDef = (key) => STEP_DEFS.find((s) => s.key === key);

/**
 * Compute the steps visible for the current form data. The Co-Applicant step
 * (6) is inserted/removed based on loan type + amount (Spec B3). Navigation is
 * driven by these keys — not raw indices — so toggling the conditional step
 * never corrupts the user's position (cf. PhonePe incident, Spec A4.3).
 *
 * @param {Record<string, unknown>} formData
 * @returns {StepDef[]}
 */
export function getVisibleSteps(formData = {}) {
  const coApplicant = requiresCoApplicant(formData.loanType, formData.loanAmount);
  return STEP_DEFS.filter((step) => step.key !== 'co-applicant' || coApplicant);
}

/** @param {Record<string, unknown>} formData @returns {string[]} */
export const getVisibleStepKeys = (formData) => getVisibleSteps(formData).map((s) => s.key);
