/**
 * Loan product catalogue.
 *
 * Central source of truth for per-loan-type constraints used across the form:
 * amount/tenure ranges, indicative interest rates, processing-fee rules, the
 * co-applicant trigger threshold, and purpose options. Steps and Zod schemas
 * read from here so business rules live in exactly one place (Spec B2 / C3.3).
 */

/** @typedef {'personal' | 'home' | 'business'} LoanTypeId */

export const LOAN_TYPES = Object.freeze({
  PERSONAL: 'personal',
  HOME: 'home',
  BUSINESS: 'business',
});

// Processing fee: 1% of amount, clamped to [2,000, 25,000] (Spec C3.3).
export const PROCESSING_FEE = Object.freeze({
  RATE: 0.01,
  MIN: 2000,
  MAX: 25000,
});

/**
 * @typedef {Object} LoanProduct
 * @property {LoanTypeId} id
 * @property {string} label
 * @property {string} blurb
 * @property {number} minAmount
 * @property {number} maxAmount
 * @property {{ min: number, max: number, step: number }} tenureMonths
 * @property {number} annualRate            Indicative p.a. rate used for EMI.
 * @property {number | null} coApplicantThreshold
 *   Amount strictly above which a co-applicant is required; null => always.
 * @property {string[]} purposes
 */

/** @type {Record<LoanTypeId, LoanProduct>} */
export const LOAN_PRODUCTS = Object.freeze({
  [LOAN_TYPES.PERSONAL]: {
    id: LOAN_TYPES.PERSONAL,
    label: 'Personal Loan',
    blurb: 'Unsecured funding for personal needs — up to ₹10 lakh.',
    minAmount: 50000,
    maxAmount: 1000000, // ₹10 lakh
    tenureMonths: { min: 12, max: 60, step: 6 },
    annualRate: 10.5,
    coApplicantThreshold: 500000, // co-applicant if amount > ₹5 lakh
    purposes: [
      'Medical Emergency',
      'Wedding',
      'Travel',
      'Debt Consolidation',
      'Education',
      'Home Renovation',
      'Other',
    ],
  },
  [LOAN_TYPES.HOME]: {
    id: LOAN_TYPES.HOME,
    label: 'Home Loan',
    blurb: 'Secured funding to buy, build, or renovate a home — up to ₹1 crore.',
    minAmount: 50000,
    maxAmount: 10000000, // ₹1 crore
    tenureMonths: { min: 60, max: 360, step: 12 },
    annualRate: 8.5,
    coApplicantThreshold: null, // Home loans ALWAYS require a co-applicant
    purposes: [
      'Purchase of New House',
      'Purchase of Resale House',
      'Plot Purchase + Construction',
      'Home Construction',
      'Home Renovation/Extension',
      'Balance Transfer',
    ],
  },
  [LOAN_TYPES.BUSINESS]: {
    id: LOAN_TYPES.BUSINESS,
    label: 'Business Loan',
    blurb: 'Working capital and expansion funding — up to ₹50 lakh.',
    minAmount: 50000,
    maxAmount: 5000000, // ₹50 lakh
    tenureMonths: { min: 12, max: 120, step: 6 },
    annualRate: 14,
    coApplicantThreshold: 2000000, // co-applicant if amount > ₹20 lakh
    purposes: [
      'Working Capital',
      'Business Expansion',
      'Equipment/Machinery Purchase',
      'Inventory Purchase',
      'Commercial Property',
      'Other',
    ],
  },
});

/** @returns {LoanProduct[]} ordered list for rendering the loan-type chooser. */
export const loanProductList = () => [
  LOAN_PRODUCTS[LOAN_TYPES.PERSONAL],
  LOAN_PRODUCTS[LOAN_TYPES.HOME],
  LOAN_PRODUCTS[LOAN_TYPES.BUSINESS],
];

/**
 * Whether the selected loan type + amount requires the co-applicant step.
 * @param {LoanTypeId | undefined} loanType
 * @param {number} amount
 * @returns {boolean}
 */
export function requiresCoApplicant(loanType, amount = 0) {
  const product = loanType ? LOAN_PRODUCTS[loanType] : undefined;
  if (!product) return false;
  if (product.coApplicantThreshold === null) return true; // Home loan
  return Number(amount) > product.coApplicantThreshold;
}
