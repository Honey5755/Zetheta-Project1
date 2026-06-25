/**
 * Accessibility audit (Spec E2) — runs axe-core (via cypress-axe) on every step
 * and fails on any critical or serious WCAG violation.
 */
describe('Accessibility (WCAG 2.1 AA)', () => {
  const audit = () => cy.checkA11y(null, { includedImpacts: ['critical', 'serious'] });

  it('has no critical/serious violations across all steps', () => {
    cy.fixture('valid-personal-loan.json').then((d) => {
      cy.startApplication();
      cy.injectAxe();

      audit(); // Step 1
      cy.fillStep1(d.step1);
      cy.clickContinue();
      audit(); // Step 2

      cy.fillStep2(d.step2);
      cy.clickContinue();
      audit(); // Step 3

      cy.fillStep3(d.step3);
      cy.clickContinue();
      audit(); // Step 4

      cy.fillStep4(d.step4);
      cy.clickContinue();
      audit(); // Step 5

      cy.fillStep5Salaried(d.step5);
      cy.clickContinue();
      audit(); // Step 7 (documents)

      cy.uploadDoc('Aadhaar card (front & back)', 'sample.pdf');
      cy.uploadDoc('Bank statements (last 6 months)', 'sample.pdf');
      cy.uploadDoc('Passport-size photograph', 'photo.png');
      cy.uploadDoc('Salary slips (last 3 months)', 'sample.pdf');
      cy.drawSignature();
      cy.wait(500);
      cy.clickContinue();
      audit(); // Step 8 (review)
    });
  });
});
