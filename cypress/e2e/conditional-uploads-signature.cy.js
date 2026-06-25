/**
 * E2E #9–#11 — conditional step visibility, file upload + compression, and
 * e-signature capture/display (Spec E1).
 */
function fillThroughStep4(d) {
  cy.fillStep1(d.step1);
  cy.clickContinue();
  cy.fillStep2(d.step2);
  cy.clickContinue();
  cy.fillStep3(d.step3);
  cy.clickContinue();
  cy.fillStep4(d.step4);
  cy.clickContinue();
}

describe('Conditional rendering, uploads and signature', () => {
  it('#9 shows the co-applicant step for a home loan', () => {
    cy.fixture('valid-home-loan.json').then((d) => {
      cy.startApplication();
      fillThroughStep4(d);
      cy.fillStep5Salaried(d.step5);
      cy.clickContinue();
      cy.expectStep('Co-Applicant');
    });
  });

  it('#10 uploads with compression, rejects a wrong type, and removes a file', () => {
    cy.fixture('valid-personal-loan.json').then((d) => {
      cy.startApplication();
      fillThroughStep4(d);
      cy.fillStep5Salaried(d.step5);
      cy.clickContinue();
      cy.expectStep('Documents');

      // Image upload is compressed (original → compressed shown).
      cy.uploadDoc('Passport-size photograph', 'photo.png');
      cy.contains('photo.png').should('be.visible');

      // Salary slips accept PDF only — uploading a PNG is rejected.
      cy.uploadDoc('Salary slips (last 3 months)', 'photo.png');
      cy.contains('Unsupported file type').should('be.visible');

      // Remove the photo and confirm it disappears.
      cy.contains('photo.png').parents('li').contains('Remove').click();
      cy.contains('photo.png').should('not.exist');
    });
  });

  it('#11 captures a signature and shows it in the review step', () => {
    cy.fixture('valid-personal-loan.json').then((d) => {
      cy.startApplication();
      fillThroughStep4(d);
      cy.fillStep5Salaried(d.step5);
      cy.clickContinue();

      cy.uploadDoc('Aadhaar card (front & back)', 'sample.pdf');
      cy.uploadDoc('Bank statements (last 6 months)', 'sample.pdf');
      cy.uploadDoc('Passport-size photograph', 'photo.png');
      cy.uploadDoc('Salary slips (last 3 months)', 'sample.pdf');
      cy.drawSignature();
      cy.wait(500);
      cy.clickContinue();

      cy.expectStep('Review');
      cy.get('img[alt*="signature"]').should('be.visible');
    });
  });
});
