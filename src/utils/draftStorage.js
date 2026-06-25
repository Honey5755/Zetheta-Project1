import { encryptJSON, decryptJSON } from './encryption.js';
import { defaultFormValues } from '../constants/defaultFormValues.js';

/**
 * Encrypted LocalStorage draft persistence (Spec C3.4).
 *
 * A draft is stored per loan type under `lendswift_draft_<loanType>` with
 * metadata (version, timestamp, step). Heavy fields (uploaded files and
 * signatures) are excluded to stay within storage quota — they are re-supplied
 * on resume. Drafts older than the 72h TTL, with a mismatched schema version,
 * or that fail to decrypt (tampered) are purged automatically.
 */

export const DRAFT_PREFIX = 'lendswift_draft_';
export const DRAFT_VERSION = '1.0';
export const DRAFT_TTL_MS = 72 * 60 * 60 * 1000;

const HEAVY_FIELDS = ['documents', 'eSignature', 'coApplicantSignature'];

export const draftKey = (loanType) => `${DRAFT_PREFIX}${loanType || 'new'}`;

function stripHeavyFields(values) {
  const copy = { ...values };
  HEAVY_FIELDS.forEach((field) => { delete copy[field]; });
  return copy;
}

/**
 * Encrypt and persist the current draft. Returns false if storage fails
 * (e.g. quota exceeded) rather than throwing.
 * @param {Record<string, unknown>} values
 * @param {string} stepKey
 * @returns {Promise<boolean>}
 */
export async function saveDraft(values, stepKey) {
  const loanType = values.loanType || 'new';
  const payload = {
    version: DRAFT_VERSION,
    timestamp: new Date().toISOString(),
    step: stepKey,
    loanType,
    values: stripHeavyFields(values),
  };
  try {
    const cipher = await encryptJSON(payload);
    localStorage.setItem(draftKey(loanType), cipher);
    return true;
  } catch (err) {
    return false;
  }
}

/** Remove every LendSwift draft (Start Fresh / post-submission cleanup). */
export function clearAllDrafts() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(DRAFT_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}

/**
 * Find the most recent valid draft, purging any that are corrupt, version-
 * mismatched, or past the TTL (Spec C3.4, E3.1).
 * @returns {Promise<{ version: string, timestamp: string, step: string,
 *   loanType: string, values: Record<string, unknown> } | null>}
 */
export async function findLatestValidDraft() {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith(DRAFT_PREFIX));
  const decoded = await Promise.all(
    keys.map(async (key) => {
      try {
        return { key, payload: await decryptJSON(localStorage.getItem(key)) };
      } catch (err) {
        return { key, payload: null };
      }
    }),
  );

  let latest = null;
  decoded.forEach(({ key, payload }) => {
    const valid = payload
      && payload.version === DRAFT_VERSION
      && Date.now() - new Date(payload.timestamp).getTime() <= DRAFT_TTL_MS;
    if (!valid) {
      localStorage.removeItem(key);
      return;
    }
    if (!latest || new Date(payload.timestamp) > new Date(latest.timestamp)) {
      latest = payload;
    }
  });
  return latest;
}

/** Merge restored draft values over the defaults so missing keys keep defaults. */
export const mergeDraftValues = (values) => ({ ...defaultFormValues, ...values });
