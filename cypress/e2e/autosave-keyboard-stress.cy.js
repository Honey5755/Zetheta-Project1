/**
 * E2E #12–#15 — auto-save & resume, keyboard navigation, rapid-navigation
 * stress, and cross-step dependency updates (Spec E1, E3).
 */
describe('Auto-save, keyboard and stress', () => {
  it('#12 saves a draft and restores it after reload (resume)', () => {
    cy.fixture('valid-personal-loan.json').then((d) => {
      cy.startApplication();
      cy.fillStep1(d.step1);
      cy.clickContinue();
      cy.fillStep2(d.step2);

      cy.contains('button', 'Save Draft').click();
      cy.wait(400); // allow async encryption + localStorage write

      cy.reload();
      cy.contains('Resume your application').should('be.visible');
      cy.contains('button', 'Resume application').click();

      cy.expectStep('Personal Information');
      cy.get('input[name="fullName"]').should('have.value', d.step2.fullName);
    });
  });

  it('#13 supports keyboard operation of controls', () => {
    cy.startApplication();
    // Select a loan type with the keyboard (focus + Space), then activate Continue with Enter.
    cy.get('input[name="loanType"][value="personal"]').focus().type(' ', { force: true });
    cy.get('input[name="loanType"][value="personal"]').should('be.checked');
    cy.get('input[name="loanAmount"]').type('300000');
    cy.get('select[name="loanTenure"]').select('24');
    cy.get('select[name="loanPurpose"]').select('Travel');
    cy.contains('button', 'Continue').focus().type('{enter}');
    cy.expectStep('Personal Information');
  });

  it('#14 survives rapid Continue clicks without corrupting state', () => {
    cy.fixture('valid-personal-loan.json').then((d) => {
      cy.startApplication();
      cy.fillStep1(d.step1);
      // Hammer the button: it should advance exactly one step and stay there.
      cy.contains('button', 'Continue').click().click().click();
      cy.expectStep('Personal Information');
      cy.contains('Step 2 of 8').should('be.visible');
    });
  });

  it('#15 updates conditional steps when loan amount changes (cross-step)', () => {
    cy.startApplication();
    cy.fillStep1({
      loanType: 'personal', amount: 300000, tenure: 24, purpose: 'Travel',
    });
    // Below threshold: no co-applicant step.
    cy.contains('Co-Applicant & Guarantor').should('not.exist');

    // Raise above ₹5L: the co-applicant step must appear in the flow.
    cy.get('input[name="loanAmount"]').clear().type('800000');
    cy.contains('Co-Applicant & Guarantor').should('exist');
  });
});
