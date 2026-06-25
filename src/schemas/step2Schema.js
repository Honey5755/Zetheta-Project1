import { z } from 'zod';
import { MOBILE_PATTERN, NAME_PATTERN, calculateAge } from '../utils/validators.js';

const nameField = (label) => z
  .string()
  .min(2, `${label} must be at least 2 characters.`)
  .max(100, `${label} must be 100 characters or fewer.`)
  .regex(NAME_PATTERN, `${label} may only contain letters, spaces and periods.`);

/**
 * Step 2 — Personal Information (Spec B2.1).
 * DOB must put the applicant between 21 and 65 (Spec E3.4 boundary cases).
 */
export function buildStep2Schema() {
  return z
    .object({
      fullName: nameField('Full name'),
      dob: z
        .string()
        .min(1, 'Enter your date of birth.')
        .refine((value) => {
          const age = calculateAge(value);
          return age !== null && age >= 21 && age <= 65;
        }, 'Applicant must be between 21 and 65 years old.'),
      gender: z.enum(['male', 'female', 'other'], {
        errorMap: () => ({ message: 'Select a gender.' }),
      }),
      maritalStatus: z.string().min(1, 'Select your marital status.'),
      fatherName: nameField("Father's name"),
      motherName: nameField("Mother's name"),
      email: z.string().min(1, 'Enter your email address.').email('Enter a valid email address.'),
      mobile: z.string().regex(MOBILE_PATTERN, 'Enter a valid 10-digit mobile starting 6–9.'),
      altMobile: z
        .string()
        .regex(MOBILE_PATTERN, 'Enter a valid 10-digit mobile starting 6–9.')
        .or(z.literal(''))
        .optional(),
    })
    .superRefine((data, ctx) => {
      if (data.altMobile && data.altMobile === data.mobile) {
        ctx.addIssue({
          path: ['altMobile'],
          code: z.ZodIssueCode.custom,
          message: 'Alternate mobile must be different from your primary mobile.',
        });
      }
    });
}
