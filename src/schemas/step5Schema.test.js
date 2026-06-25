import { describe, it, expect } from 'vitest';
import { buildStep5Schema } from './step5Schema.js';

const issuePaths = (result) => result.error.issues.map((i) => i.path.join('.'));

describe('buildStep5Schema (Spec B2.1, B3)', () => {
  it('requires an employment type', () => {
    const result = buildStep5Schema({}).safeParse({ employmentType: '' });
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain('employmentType');
  });

  it('blocks a salaried applicant from a business loan (cross-step rule)', () => {
    const result = buildStep5Schema({ loanType: 'business' }).safeParse({
      employmentType: 'salaried',
      companyName: 'Acme',
      designation: 'Engineer',
      monthlyNetSalary: 90000,
      yearsOfExperience: 5,
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toMatch(/business loan requires/i);
  });

  it('accepts a valid salaried applicant for a personal loan', () => {
    const result = buildStep5Schema({ loanType: 'personal' }).safeParse({
      employmentType: 'salaried',
      companyName: 'Acme Corp',
      designation: 'Engineer',
      monthlyNetSalary: 90000,
      yearsOfExperience: 5,
    });
    expect(result.success).toBe(true);
  });

  it('requires a GSTIN for a business owner', () => {
    const result = buildStep5Schema({ loanType: 'business' }).safeParse({
      employmentType: 'business-owner',
      businessName: 'Acme Traders',
      businessType: 'proprietorship',
      annualTurnover: 5000000,
      yearsInBusiness: 4,
      gstNumber: '',
      yearsOfExperience: 6,
      officeAddress: '12 MG Road, Bengaluru',
    });
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toContain('gstNumber');
  });
});
