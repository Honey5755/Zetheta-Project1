/**
 * Document requirements (Spec B2.1 Step 7). Each definition declares accepted
 * MIME types, max size, and whether multiple files are allowed. The required
 * set is computed from loan type + employment type, and the PAN copy becomes
 * optional once PAN is verified (cross-step rule, Spec B3).
 */

const PDF = 'application/pdf';
const JPG = 'image/jpeg';
const PNG = 'image/png';

/** @typedef {Object} DocumentDef
 * @property {string} id
 * @property {string} label
 * @property {string[]} accept   Accepted MIME types.
 * @property {number} maxSizeMB
 * @property {boolean} multiple
 */

/** @type {Record<string, DocumentDef>} */
export const DOCUMENT_DEFS = {
  pan: {
    id: 'pan', label: 'PAN Card copy', accept: [PDF, JPG, PNG], maxSizeMB: 5, multiple: false,
  },
  aadhaar: {
    id: 'aadhaar', label: 'Aadhaar card (front & back)', accept: [PDF, JPG, PNG], maxSizeMB: 5, multiple: true,
  },
  bankStatements: {
    id: 'bankStatements', label: 'Bank statements (last 6 months)', accept: [PDF], maxSizeMB: 10, multiple: false,
  },
  photo: {
    id: 'photo', label: 'Passport-size photograph', accept: [JPG, PNG], maxSizeMB: 2, multiple: false,
  },
  salarySlips: {
    id: 'salarySlips', label: 'Salary slips (last 3 months)', accept: [PDF], maxSizeMB: 5, multiple: true,
  },
  itr: {
    id: 'itr', label: 'ITR (last 2 years)', accept: [PDF], maxSizeMB: 5, multiple: true,
  },
  property: {
    id: 'property', label: 'Property documents', accept: [PDF], maxSizeMB: 10, multiple: false,
  },
  businessReg: {
    id: 'businessReg', label: 'Business registration certificate', accept: [PDF], maxSizeMB: 5, multiple: false,
  },
  gstReturns: {
    id: 'gstReturns', label: 'GST returns (last 4 quarters)', accept: [PDF], maxSizeMB: 5, multiple: true,
  },
};

/**
 * Compute the required documents for the current application (Spec B2.1, B3).
 * @param {Record<string, unknown>} values
 * @returns {(DocumentDef & { optional?: boolean })[]}
 */
export function getRequiredDocuments(values = {}) {
  const { loanType, employmentType, panVerified } = values;
  const docs = [
    { ...DOCUMENT_DEFS.pan, optional: Boolean(panVerified) },
    DOCUMENT_DEFS.aadhaar,
    DOCUMENT_DEFS.bankStatements,
    DOCUMENT_DEFS.photo,
  ];

  if (employmentType === 'salaried') docs.push(DOCUMENT_DEFS.salarySlips);
  if (employmentType === 'self-employed' || employmentType === 'business-owner') {
    docs.push(DOCUMENT_DEFS.itr);
  }
  if (loanType === 'home') docs.push(DOCUMENT_DEFS.property);
  if (loanType === 'business') {
    docs.push(DOCUMENT_DEFS.businessReg, DOCUMENT_DEFS.gstReturns);
  }
  return docs;
}
