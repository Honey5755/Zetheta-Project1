import { z } from 'zod';
import { buildStep1Schema } from './step1Schema.js';
import { buildStep2Schema } from './step2Schema.js';
import { buildStep3Schema } from './step3Schema.js';
import { buildStep4Schema } from './step4Schema.js';
import { buildStep5Schema } from './step5Schema.js';
import { buildStep6Schema } from './step6Schema.js';
import { buildStep7Schema } from './step7Schema.js';
import { buildStep8Schema } from './step8Schema.js';

/** Permissive schema for steps not yet implemented (navigation passes through). */
const PASS_THROUGH = z.object({}).passthrough();

/**
 * Return the Zod schema for a given step, constructed from the full form values
 * so cross-step dependencies (Spec B3) can be encoded (Spec A2.3 — composable
 * schemas). The Wizard's resolver calls this with the current step key, so RHF
 * validates only the active step's fields.
 *
 * @param {string} stepKey
 * @param {Record<string, unknown>} values  Full form values.
 * @returns {import('zod').ZodTypeAny}
 */
export function getStepSchema(stepKey, values = {}) {
  switch (stepKey) {
    case 'loan-type':
      return buildStep1Schema(values);
    case 'personal':
      return buildStep2Schema(values);
    case 'kyc':
      return buildStep3Schema(values);
    case 'address':
      return buildStep4Schema(values);
    case 'employment':
      return buildStep5Schema(values);
    case 'co-applicant':
      return buildStep6Schema(values);
    case 'documents':
      return buildStep7Schema(values);
    case 'review':
      return buildStep8Schema(values);
    default:
      return PASS_THROUGH;
  }
}
