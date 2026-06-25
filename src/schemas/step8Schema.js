import { z } from 'zod';
import { calculateLoanSummary } from '../utils/emiCalculator.js';

const consent = (message) => z.literal(true, { errorMap: () => ({ message }) });

/**
 * Step 8 — Review & Consents (Spec B2.1, A3.1). All four RBI-mandated consents
 * are individual and required. When the EMI exceeds 50% of income an extra
 * affordability acknowledgement is required (Spec Day 9).
 *
 * @param {Record<string, unknown>} values
 */
export function buildStep8Schema(values = {}) {
  const summary = calculateLoanSummary(values);
  const needsAck = summary.emiToIncomeRatio !== null && summary.emiToIncomeRatio > 0.5;

  return z
    .object({
      confirmAccurate: consent('Please confirm that all information provided is accurate.'),
      consentCredit: consent('You must authorise the credit-bureau check to proceed.'),
      consentTerms: consent('You must accept the Terms & Conditions to proceed.'),
      consentComms: consent('Please consent to receive communications about this application.'),
      affordabilityAck: z.boolean(),
    })
    .passthrough()
    .superRefine((data, ctx) => {
      if (needsAck && !data.affordabilityAck) {
        ctx.addIssue({
          path: ['affordabilityAck'],
          code: z.ZodIssueCode.custom,
          message: 'Please acknowledge the affordability warning to submit.',
        });
      }
    });
}
