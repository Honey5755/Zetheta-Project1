import { z } from 'zod';
import { NAME_PATTERN, isValidPanFormat, panEntityChar } from '../utils/validators.js';

/**
 * Step 6 — Co-Applicant & Guarantor (Spec B2.1). Only validated when the step
 * is active (loan type / amount trigger it). The co-applicant must be an
 * individual (PAN 4th char P), verified, with income and explicit consent.
 */
export function buildStep6Schema() {
  return z
    .object({
      coApplicantName: z
        .string()
        .min(2, "Enter the co-applicant's full name.")
        .max(100)
        .regex(NAME_PATTERN, 'Name may only contain letters, spaces and periods.'),
      coApplicantRelationship: z.string().min(1, 'Select the relationship to the applicant.'),
      coApplicantPan: z.string().min(1, "Enter the co-applicant's PAN."),
      coApplicantPanVerified: z.boolean(),
      coApplicantIncome: z.union([z.number(), z.literal('')]).optional(),
      coApplicantConsent: z.boolean(),
    })
    .passthrough()
    .superRefine((data, ctx) => {
      if (!isValidPanFormat(data.coApplicantPan)) {
        ctx.addIssue({
          path: ['coApplicantPan'],
          code: z.ZodIssueCode.custom,
          message: 'PAN must be 10 characters in the format AAAAA9999A.',
        });
      } else if (panEntityChar(data.coApplicantPan) !== 'P') {
        ctx.addIssue({
          path: ['coApplicantPan'],
          code: z.ZodIssueCode.custom,
          message: 'Co-applicant PAN must belong to an individual (4th character must be P).',
        });
      } else if (!data.coApplicantPanVerified) {
        ctx.addIssue({
          path: ['coApplicantPan'],
          code: z.ZodIssueCode.custom,
          message: "Please verify the co-applicant's PAN to continue.",
        });
      }

      if (!(Number(data.coApplicantIncome) > 0)) {
        ctx.addIssue({
          path: ['coApplicantIncome'],
          code: z.ZodIssueCode.custom,
          message: "Enter the co-applicant's monthly income.",
        });
      }

      if (!data.coApplicantConsent) {
        ctx.addIssue({
          path: ['coApplicantConsent'],
          code: z.ZodIssueCode.custom,
          message: 'Co-applicant consent is required to proceed.',
        });
      }
    });
}
