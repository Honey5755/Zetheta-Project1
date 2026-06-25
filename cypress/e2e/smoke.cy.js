/**
 * Smoke test — verifies the app boots and the wizard shell renders.
 * Full user-journey specs are added in Sprint 3 (Days 11–13).
 */
describe('App smoke', () => {
  it('loads the wizard on the first step', () => {
    cy.startApplication();
    cy.findStepHeading().should('contain.text', 'Loan Type');
    cy.contains('Step 1 of 8').should('be.visible');
    cy.contains('button', 'Continue').should('be.enabled');
  });
});
