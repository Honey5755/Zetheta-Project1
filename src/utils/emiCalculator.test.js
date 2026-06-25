import { describe, it, expect } from 'vitest';
import {
  calculateEMI, calculateProcessingFee, calculateLoanSummary, deriveMonthlyIncome,
} from './emiCalculator.js';

describe('EMI calculation (Spec C3.3)', () => {
  it('computes EMI with the reducing-balance formula', () => {
    // ₹10,00,000 @ 10.5% for 60 months ≈ ₹21,494
    expect(calculateEMI(1000000, 10.5, 60)).toBe(21494);
  });

  it('returns 0 for invalid inputs', () => {
    expect(calculateEMI(0, 10.5, 60)).toBe(0);
    expect(calculateEMI(100000, 10.5, 0)).toBe(0);
  });

  it('clamps the processing fee to [2000, 25000]', () => {
    expect(calculateProcessingFee(1000000)).toBe(10000); // 1%
    expect(calculateProcessingFee(100000)).toBe(2000); // 1% = 1000 -> min 2000
    expect(calculateProcessingFee(5000000)).toBe(25000); // 1% = 50000 -> max 25000
  });
});

describe('affordability (Spec B3 / Day 9)', () => {
  it('derives income and flags EMI > 50% of income', () => {
    const summary = calculateLoanSummary({
      loanType: 'personal',
      loanAmount: 1000000,
      loanTenure: 12,
      employmentType: 'salaried',
      monthlyNetSalary: 30000,
    });
    expect(summary.monthlyIncome).toBe(30000);
    expect(summary.withinAffordability).toBe(false); // EMI far exceeds 50%
  });

  it('adds co-applicant income to the affordability check', () => {
    const income = deriveMonthlyIncome({
      employmentType: 'salaried',
      monthlyNetSalary: 50000,
      coApplicantIncome: 40000,
    });
    expect(income).toBe(90000);
  });

  it('total cost of borrowing equals total payable minus principal', () => {
    const s = calculateLoanSummary({
      loanType: 'home', loanAmount: 2000000, loanTenure: 120, employmentType: 'salaried', monthlyNetSalary: 200000,
    });
    expect(s.totalCostOfBorrowing).toBe(s.totalPayable - s.principal);
    expect(s.totalPayable).toBe(s.emi * s.months);
  });
});
