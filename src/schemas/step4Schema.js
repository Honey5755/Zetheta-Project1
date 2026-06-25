import { z } from 'zod';

const PIN_REGEX = /^\d{6}$/;

/**
 * Step 4 — Address Information (Spec B2.1, A3.3).
 *
 * Conditional requirements:
 *  - rent amount required when residence type is "Rented";
 *  - previous address required when < 1 year at the current address;
 *  - permanent address required when "Same as current" is unchecked.
 */
export function buildStep4Schema() {
  return z
    .object({
      currentAddressLine1: z
        .string()
        .min(5, 'Address line 1 must be at least 5 characters.')
        .max(200, 'Address line 1 must be 200 characters or fewer.'),
      currentAddressLine2: z.string().max(200, 'Address line 2 must be 200 characters or fewer.').optional(),
      pinCode: z.string().regex(PIN_REGEX, 'Enter a valid 6-digit PIN code.'),
      city: z.string().min(1, 'City is required.'),
      state: z.string().min(1, 'State is required.'),
      residenceType: z.string().min(1, 'Select your residence type.'),
      rentAmount: z.union([z.number(), z.literal('')]).optional(),
      yearsAtCurrentAddress: z.coerce
        .number({ invalid_type_error: 'Enter the number of years at this address.' })
        .min(0, 'Enter a value between 0 and 50.')
        .max(50, 'Enter a value between 0 and 50.'),
      previousAddressLine1: z.string().optional(),
      previousPinCode: z.string().optional(),
      sameAsPermanent: z.boolean(),
      permanentAddressLine1: z.string().optional(),
      permanentAddressLine2: z.string().optional(),
      permanentPinCode: z.string().optional(),
      permanentCity: z.string().optional(),
      permanentState: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.residenceType === 'rented' && !(Number(data.rentAmount) > 0)) {
        ctx.addIssue({
          path: ['rentAmount'],
          code: z.ZodIssueCode.custom,
          message: 'Enter your monthly rent.',
        });
      }

      if (Number(data.yearsAtCurrentAddress) < 1) {
        if (!data.previousAddressLine1 || data.previousAddressLine1.length < 5) {
          ctx.addIssue({
            path: ['previousAddressLine1'],
            code: z.ZodIssueCode.custom,
            message: 'Previous address is required when you have lived here under a year.',
          });
        }
        if (!PIN_REGEX.test(data.previousPinCode || '')) {
          ctx.addIssue({
            path: ['previousPinCode'],
            code: z.ZodIssueCode.custom,
            message: 'Enter a valid 6-digit PIN code for your previous address.',
          });
        }
      }

      if (!data.sameAsPermanent) {
        if (!data.permanentAddressLine1 || data.permanentAddressLine1.length < 5) {
          ctx.addIssue({
            path: ['permanentAddressLine1'],
            code: z.ZodIssueCode.custom,
            message: 'Permanent address line 1 is required.',
          });
        }
        if (!PIN_REGEX.test(data.permanentPinCode || '')) {
          ctx.addIssue({
            path: ['permanentPinCode'],
            code: z.ZodIssueCode.custom,
            message: 'Enter a valid 6-digit PIN code.',
          });
        }
        if (!data.permanentCity) {
          ctx.addIssue({ path: ['permanentCity'], code: z.ZodIssueCode.custom, message: 'City is required.' });
        }
        if (!data.permanentState) {
          ctx.addIssue({ path: ['permanentState'], code: z.ZodIssueCode.custom, message: 'State is required.' });
        }
      }
    });
}
