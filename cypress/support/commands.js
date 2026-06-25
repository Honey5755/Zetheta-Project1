/**
 * Custom Cypress commands shared across specs (Spec Day 11).
 *
 * Per-step fill helpers (fillStep1, fillStep2, …) are added here as each step
 * is implemented so the happy-path and journey specs stay concise.
 */

// Visit the app and wait for the first step heading to be focusable.
Cypress.Commands.add('startApplication', () => {
  cy.visit('/');
  cy.findStepHeading().should('be.visible');
});

// The wizard renders the active step's title under #step-heading.
Cypress.Commands.add('findStepHeading', () => cy.get('#step-heading'));
