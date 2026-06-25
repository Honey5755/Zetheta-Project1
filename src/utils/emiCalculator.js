import { LOAN_PRODUCTS, PROCESSING_FEE } from '../constants/loanProducts.js';

/**
 * EMI and cost-of-borrowing calculations (Spec C3.3).
 *
 * EMI = P · r · (1+r)^n / ((1+r)^n − 1), where r = annualRate / 12 / 100 and n
 * is the tenure in months. Total cost of borrowing = (EMI × n) − P. Processing
 * fee = 1% of principal clamped to [₹2,000, ₹25,000].
 */

/**
 * @param {number} principal
 * @param {number} annualRate  percent per annum
 * @param {number} months
 * @returns {number} rounded monthly EMI
 */
export function calculateEMI(principal, annualRate, months) {
  const p = Number(principal);
  const n = Number(months);
  const r = Number(annualRate) / 12 / 100;
  if (!(p > 0) || !(n > 0)) return 0;
  if (r === 0) return Math.round(p / n);
  const factor = (1 + r) ** n;
  return Math.round((p * r * factor) / (factor - 1));
}

/** Processing fee: 1% of principal, clamped to [MIN, MAX] (Spec C3.3). */
export function calculateProcessingFee(principal) {
  const fee = Number(principal) * PROCESSING_FEE.RATE;
  return Math.round(Math.min(PROCESSING_FEE.MAX, Math.max(PROCESSING_FEE.MIN, fee)));
}

/**
 * Derive the applicant's monthly income for the affordability check, adding the
 * co-applicant's income when present (Spec B3 — combined EMI ratio).
 * @param {Record<string, unknown>} values
 * @returns {number}
 */
export function deriveMonthlyIncome(values) {
  const { employmentType } = values;
  let income = 0;
  if (employmentType === 'salaried') income = Number(values.monthlyNetSalary) || 0;
  else if (employmentType === 'self-employed') income = Number(values.monthlyIncome) || 0;
  else if (employmentType === 'business-owner') income = (Number(values.annualTurnover) || 0) / 12;
  income += Number(values.coApplicantIncome) || 0;
  return Math.round(income);
}

/**
 * Compute the full pre-approval summary (Key Fact Statement) from form values.
 * @param {Record<string, unknown>} values
 */
export function calculateLoanSummary(values = {}) {
  const principal = Number(values.loanAmount) || 0;
  const months = Number(values.loanTenure) || 0;
  const product = LOAN_PRODUCTS[values.loanType];
  const annualRate = product ? product.annualRate : 0;

  const emi = calculateEMI(principal, annualRate, months);
  const totalPayable = emi * months;
  const totalCostOfBorrowing = Math.max(0, totalPayable - principal);
  const processingFee = calculateProcessingFee(principal);

  const monthlyIncome = deriveMonthlyIncome(values);
  const emiToIncomeRatio = monthlyIncome > 0 ? emi / monthlyIncome : null;
  const withinAffordability = emiToIncomeRatio === null ? true : emiToIncomeRatio <= 0.5;

  return {
    principal,
    months,
    annualRate,
    emi,
    totalPayable,
    totalCostOfBorrowing,
    processingFee,
    monthlyIncome,
    emiToIncomeRatio,
    withinAffordability,
  };
}
