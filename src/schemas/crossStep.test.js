import { describe, it, expect } from 'vitest';
import { getVisibleStepKeys } from '../constants/steps.js';
import { requiresCoApplicant } from '../constants/loanProducts.js';
import { getRequiredDocuments } from '../constants/documents.js';
import { buildStep1Schema } from './step1Schema.js';

const dobForAge = (age) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age);
  d.setDate(d.getDate() - 1); // safely past the birthday
  return d.toISOString().slice(0, 10);
};

const docIds = (values) => getRequiredDocuments(values).map((d) => d.id);

// Verifies the Section B3 cross-step dependency map end-to-end.
describe('Cross-step dependencies (Spec B3)', () => {
  describe('Loan amount / type -> Co-applicant step visibility', () => {
    it('hides the co-applicant step for a small personal loan', () => {
      expect(getVisibleStepKeys({ loanType: 'personal', loanAmount: 300000 }))
        .not.toContain('co-applicant');
    });

    it('treats exactly ₹5,00,000 as below threshold (Spec E3.4 boundary)', () => {
      expect(requiresCoApplicant('personal', 500000)).toBe(false);
      expect(requiresCoApplicant('personal', 500001)).toBe(true);
    });

    it('always shows the co-applicant step for home loans', () => {
      expect(getVisibleStepKeys({ loanType: 'home', loanAmount: 2000000 }))
        .toContain('co-applicant');
    });

    it('shows the co-applicant step for business loans above ₹20L only', () => {
      expect(requiresCoApplicant('business', 2000000)).toBe(false);
      expect(requiresCoApplicant('business', 2000001)).toBe(true);
    });
  });

  describe('Employment / loan type -> document requirements', () => {
    it('requires salary slips for salaried, not ITR', () => {
      const ids = docIds({ loanType: 'personal', employmentType: 'salaried' });
      expect(ids).toContain('salarySlips');
      expect(ids).not.toContain('itr');
    });

    it('requires ITR for self-employed, not salary slips', () => {
      const ids = docIds({ loanType: 'business', employmentType: 'business-owner' });
      expect(ids).toContain('itr');
      expect(ids).toContain('businessReg');
      expect(ids).toContain('gstReturns');
      expect(ids).not.toContain('salarySlips');
    });

    it('adds property documents for home loans', () => {
      expect(docIds({ loanType: 'home', employmentType: 'salaried' })).toContain('property');
    });
  });

  describe('PAN verified -> PAN copy optional', () => {
    it('marks the PAN copy optional once PAN is verified', () => {
      const docs = getRequiredDocuments({ loanType: 'personal', panVerified: true });
      expect(docs.find((d) => d.id === 'pan').optional).toBe(true);
      const docsUnverified = getRequiredDocuments({ loanType: 'personal', panVerified: false });
      expect(docsUnverified.find((d) => d.id === 'pan').optional).toBe(false);
    });
  });

  describe('DOB -> max loan tenure (age + tenure <= 65)', () => {
    it('rejects a tenure that would extend past age 65', () => {
      const result = buildStep1Schema({ dob: dobForAge(50) }).safeParse({
        loanType: 'home',
        loanAmount: 2000000,
        loanTenure: 300, // 25 years -> ends at 75, exceeds the (65-50)*12=180 cap
        loanPurpose: 'Purchase of New House',
      });
      expect(result.success).toBe(false);
      expect(result.error.issues.some((i) => i.path[0] === 'loanTenure')).toBe(true);
    });

    it('accepts a tenure that ends before age 65', () => {
      const result = buildStep1Schema({ dob: dobForAge(30) }).safeParse({
        loanType: 'home',
        loanAmount: 2000000,
        loanTenure: 240, // 20 years -> ends at 50, within cap
        loanPurpose: 'Purchase of New House',
      });
      expect(result.success).toBe(true);
    });
  });
});
