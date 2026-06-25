import { z } from 'zod';
import { LOAN_PRODUCTS, LOAN_TYPES } from '../constants/loanProducts.js';
import { formatINR } from '../utils/indianFormat.js';
import { calculateAge } from '../utils/validators.js';

/**
 * Step 1 — Loan Type & Basic Information (Spec B2.1).
 *
 * Amount and tenure ranges are loan-type dependent, so the schema is built as a
 * function of the *full* form values. It also encodes the cross-step rule from
 * Section B3: age (from Step 2's DOB) + tenure must not extend beyond age 65.
 *
 * @param {Record<string, unknown>} values  Full form values.
 */
export function buildStep1Schema(values = {}) {
  return z
    .object({
      loanType: z.enum([LOAN_TYPES.PERSONAL, LOAN_TYPES.HOME, LOAN_TYPES.BUSINESS], {
        errorMap: () => ({ message: 'Select a loan type to continue.' }),
      }),
      loanAmount: z
        .number({ invalid_type_error: 'Enter the loan amount you need.' })
        .int('Enter a whole rupee amount.')
        .positive('Enter the loan amount you need.'),
      loanTenure: z.coerce
        .number({ invalid_type_error: 'Select a repayment tenure.' })
        .int()
        .positive('Select a repayment tenure.'),
      loanPurpose: z.string().min(1, 'Select the purpose of the loan.'),
      referralCode: z
        .string()
        .regex(/^[A-Za-z0-9]{6,10}$/, 'Referral code must be 6–10 letters or numbers.')
        .or(z.literal(''))
        .optional(),
    })
    .superRefine((data, ctx) => {
      const product = LOAN_PRODUCTS[data.loanType];
      if (!product) return;

      if (data.loanAmount < product.minAmount) {
        ctx.addIssue({
          path: ['loanAmount'],
          code: z.ZodIssueCode.custom,
          message: `Minimum amount for a ${product.label} is ${formatINR(product.minAmount)}.`,
        });
      }
      if (data.loanAmount > product.maxAmount) {
        ctx.addIssue({
          path: ['loanAmount'],
          code: z.ZodIssueCode.custom,
          message: `Maximum amount for a ${product.label} is ${formatINR(product.maxAmount)}.`,
        });
      }

      if (data.loanTenure > 0) {
        const { min, max } = product.tenureMonths;
        if (data.loanTenure < min || data.loanTenure > max) {
          ctx.addIssue({
            path: ['loanTenure'],
            code: z.ZodIssueCode.custom,
            message: `Tenure for a ${product.label} must be between ${min} and ${max} months.`,
          });
        }

        // Cross-step (Spec B3): DOB (Step 2) caps the tenure so the loan ends
        // before the applicant turns 65.
        const age = calculateAge(values.dob);
        if (age !== null) {
          const maxByAge = (65 - age) * 12;
          if (data.loanTenure > maxByAge) {
            ctx.addIssue({
              path: ['loanTenure'],
              code: z.ZodIssueCode.custom,
              message: `At your age the loan must end by 65 — maximum tenure is ${maxByAge} months.`,
            });
          }
        }
      }
    });
}
