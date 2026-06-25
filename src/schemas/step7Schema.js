import { z } from 'zod';
import { getRequiredDocuments } from '../constants/documents.js';

/**
 * Step 7 — Document Upload & E-Signature (Spec B2.1, B3). The required document
 * set depends on loan type, employment type and PAN-verified status; every
 * required document needs at least one file, and a signature is mandatory.
 *
 * @param {Record<string, unknown>} values
 */
export function buildStep7Schema(values = {}) {
  const required = getRequiredDocuments(values).filter((doc) => !doc.optional);
  return z
    .object({
      documents: z.record(z.any()).optional(),
      eSignature: z.string(),
    })
    .passthrough()
    .superRefine((data, ctx) => {
      required.forEach((doc) => {
        const files = data.documents?.[doc.id];
        if (!Array.isArray(files) || files.length === 0) {
          ctx.addIssue({
            path: ['documents', doc.id],
            code: z.ZodIssueCode.custom,
            message: `${doc.label} is required.`,
          });
        }
      });
      if (!data.eSignature) {
        ctx.addIssue({
          path: ['eSignature'],
          code: z.ZodIssueCode.custom,
          message: 'Please provide your signature to continue.',
        });
      }
    });
}
