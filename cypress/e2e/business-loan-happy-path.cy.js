/**
 * E2E #3 (P0) — Business loan happy path: business owner with GST, ITR and
 * business registration documents (Spec E1).
 */
describe('Business loan happy path', () => {
  it('completes and submits a business loan as a business owner', () => {
    cy.fixture('valid-business-loan.json').then((d) => {
      cy.startApplication();

      cy.fillStep1(d.step1);
      cy.clickContinue();
      cy.fillStep2(d.step2);
      cy.clickContinue();
      cy.fillStep3(d.step3);
      cy.clickContinue();
      cy.fillStep4(d.step4);
      cy.clickContinue();
      cy.fillStep5Business(d.step5business);
      cy.clickContinue();

      // ₹30L business loan exceeds the ₹20L threshold — co-applicant required.
      cy.expectStep('Co-Applicant');
      cy.fillCoApplicant(d.coApplicant);
      cy.clickContinue();

      cy.expectStep('Documents');
      cy.uploadDoc('Aadhaar card (front & back)', 'sample.pdf');
      cy.uploadDoc('Bank statements (last 6 months)', 'sample.pdf');
      cy.uploadDoc('Passport-size photograph', 'photo.png');
      cy.uploadDoc('ITR (last 2 years)', 'sample.pdf');
      cy.uploadDoc('Business registration certificate', 'sample.pdf');
      cy.uploadDoc('GST returns (last 4 quarters)', 'sample.pdf');
      cy.drawSignature();
      cy.wait(500);
      cy.clickContinue();

      cy.expectStep('Review');
      cy.checkConsents();
      cy.contains('button', 'Submit application').click();

      cy.contains('Application submitted').should('be.visible');
    });
  });
});
