import { z } from 'zod';
import { GST_PATTERN } from '../utils/validators.js';

const experience = z.coerce
  .number({ invalid_type_error: 'Enter your years of experience.' })
  .min(0, 'Enter a value between 0 and 50.')
  .max(50, 'Enter a value between 0 and 50.');

const salariedSchema = z.object({
  employmentType: z.literal('salaried'),
  companyName: z.string().min(1, 'Company name is required.'),
  designation: z.string().min(1, 'Designation is required.'),
  monthlyNetSalary: z
    .number({ invalid_type_error: 'Enter your monthly net salary.' })
    .min(15000, 'Minimum monthly net salary is ₹15,000.'),
  yearsOfExperience: experience,
});

const selfEmployedSchema = z.object({
  employmentType: z.literal('self-employed'),
  businessName: z.string().min(1, 'Business name is required.'),
  businessType: z.string().min(1, 'Select a business type.'),
  annualTurnover: z
    .number({ invalid_type_error: 'Enter your annual turnover.' })
    .min(300000, 'Minimum annual turnover is ₹3,00,000.'),
  yearsInBusiness: z.coerce
    .number({ invalid_type_error: 'Enter your years in business.' })
    .min(2, 'You must have at least 2 years in business.')
    .max(80, 'Enter a valid number of years.'),
  monthlyIncome: z
    .number({ invalid_type_error: 'Enter your monthly income.' })
    .min(1, 'Enter your monthly income.'),
  yearsOfExperience: experience,
  officeAddress: z.string().min(5, 'Enter your office / business address.'),
});

const businessOwnerSchema = z.object({
  employmentType: z.literal('business-owner'),
  businessName: z.string().min(1, 'Business name is required.'),
  businessType: z.string().min(1, 'Select a business type.'),
  annualTurnover: z
    .number({ invalid_type_error: 'Enter your annual turnover.' })
    .min(300000, 'Minimum annual turnover is ₹3,00,000.'),
  yearsInBusiness: z.coerce
    .number({ invalid_type_error: 'Enter your years in business.' })
    .min(2, 'You must have at least 2 years in business.')
    .max(80, 'Enter a valid number of years.'),
  gstNumber: z.string().regex(GST_PATTERN, 'Enter a valid 15-character GSTIN.'),
  yearsOfExperience: experience,
  officeAddress: z.string().min(5, 'Enter your office / business address.'),
});

// Discriminated union over employment type (Spec A2.3 / Day 6).
const employmentUnion = z.discriminatedUnion('employmentType', [
  salariedSchema,
  selfEmployedSchema,
  businessOwnerSchema,
]);

const BRANCHES = ['salaried', 'self-employed', 'business-owner'];

/**
 * Step 5 — Employment & Income (Spec B2.1, B3).
 *
 * Builds a discriminated-union validation over the employment type, plus the
 * cross-step rule that a business loan cannot be taken by a salaried applicant.
 *
 * @param {Record<string, unknown>} values  Full form values.
 */
export function buildStep5Schema(values = {}) {
  return z
    .object({ employmentType: z.string() })
    .passthrough()
    .superRefine((data, ctx) => {
      const type = data.employmentType;
      if (!type || !BRANCHES.includes(type)) {
        ctx.addIssue({
          path: ['employmentType'],
          code: z.ZodIssueCode.custom,
          message: 'Select your employment type.',
        });
        return;
      }

      // Cross-step (Spec B3): a business loan requires a self-employed or
      // business-owner applicant — not salaried.
      if (values.loanType === 'business' && type === 'salaried') {
        ctx.addIssue({
          path: ['employmentType'],
          code: z.ZodIssueCode.custom,
          message: 'A business loan requires a self-employed or business-owner applicant.',
        });
        return;
      }

      const result = employmentUnion.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({ path: issue.path, code: z.ZodIssueCode.custom, message: issue.message });
        });
      }
    });
}
