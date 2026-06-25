/**
 * E2E #1 (P0) — Personal loan happy path: salaried applicant, all valid data,
 * document uploads, e-signature, successful submission (Spec E1).
 */
describe('Personal loan happy path', () => {
  it('completes and submits a salaried personal loan application', () => {
    cy.fixture('valid-personal-loan.json').then((d) => {
      cy.startApplication();

      cy.expectStep('Loan Type');
      cy.fillStep1(d.step1);
      cy.clickContinue();

      cy.expectStep('Personal Information');
      cy.fillStep2(d.step2);
      cy.clickContinue();

      cy.expectStep('Identity');
      cy.fillStep3(d.step3);
      cy.clickContinue();

      cy.expectStep('Address');
      cy.fillStep4(d.step4);
      cy.clickContinue();

      cy.expectStep('Employment');
      cy.fillStep5Salaried(d.step5);
      cy.clickContinue();

      // Personal loan of ₹3L is below the co-applicant threshold — Step 6 skipped.
      cy.expectStep('Documents');
      cy.uploadDoc('Aadhaar card (front & back)', 'sample.pdf');
      cy.uploadDoc('Bank statements (last 6 months)', 'sample.pdf');
      cy.uploadDoc('Passport-size photograph', 'photo.png');
      cy.uploadDoc('Salary slips (last 3 months)', 'sample.pdf');
      cy.drawSignature();
      cy.wait(500);
      cy.clickContinue();

      cy.expectStep('Review');
      cy.contains('Pre-approval summary').should('be.visible');
      cy.checkConsents();
      cy.contains('button', 'Submit application').click();

      cy.contains('Application submitted').should('be.visible');
      cy.contains('LS-').should('exist');
    });
  });
});
