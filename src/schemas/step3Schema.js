import { z } from 'zod';
import { isValidAadhaar, panErrorMessage } from '../utils/validators.js';

/**
 * Step 3 — Identity Verification / KYC (Spec B2.1, A3.2).
 *
 * PAN entity rules depend on the loan type (Step 1), so the schema is built
 * from the full values. PAN/Aadhaar must be both well-formed AND "verified"
 * (the simulated check sets the *Verified flags), and Aadhaar consent is
 * mandatory before progressing.
 *
 * @param {Record<string, unknown>} values
 */
export function buildStep3Schema(values = {}) {
  return z
    .object({
      pan: z.string().min(1, 'Enter your PAN.'),
      panVerified: z.boolean(),
      aadhaar: z.string().min(1, 'Enter your Aadhaar number.'),
      aadhaarVerified: z.boolean(),
      aadhaarConsent: z.boolean(),
      voterId: z
        .string()
        .regex(/^[A-Z]{3}[0-9]{7}$/, 'Voter ID must be 3 letters followed by 7 digits.')
        .or(z.literal(''))
        .optional(),
      passport: z
        .string()
        .regex(/^[A-Z][0-9]{7}$/, 'Passport must be 1 letter followed by 7 digits.')
        .or(z.literal(''))
        .optional(),
    })
    .superRefine((data, ctx) => {
      const panMsg = panErrorMessage(data.pan, values.loanType);
      if (panMsg) {
        ctx.addIssue({ path: ['pan'], code: z.ZodIssueCode.custom, message: panMsg });
      } else if (!data.panVerified) {
        ctx.addIssue({
          path: ['pan'],
          code: z.ZodIssueCode.custom,
          message: 'Please verify your PAN to continue.',
        });
      }

      if (!isValidAadhaar(data.aadhaar)) {
        ctx.addIssue({
          path: ['aadhaar'],
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid 12-digit Aadhaar number (checksum failed).',
        });
      } else if (!data.aadhaarVerified) {
        ctx.addIssue({
          path: ['aadhaar'],
          code: z.ZodIssueCode.custom,
          message: 'Please verify your Aadhaar to continue.',
        });
      }

      if (!data.aadhaarConsent) {
        ctx.addIssue({
          path: ['aadhaarConsent'],
          code: z.ZodIssueCode.custom,
          message: 'You must consent to Aadhaar verification to continue.',
        });
      }
    });
}
