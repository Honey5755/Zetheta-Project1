/**
 * Custom Cypress commands shared across specs (Spec Day 11).
 *
 * Fields are targeted by their `name` attribute (set via RHF register /
 * Controller) and uploads by the input's aria-label, keeping the specs concise.
 */

Cypress.Commands.add('startApplication', () => {
  cy.visit('/');
  cy.findStepHeading().should('be.visible');
});

Cypress.Commands.add('findStepHeading', () => cy.get('#step-heading'));

Cypress.Commands.add('expectStep', (text) => {
  cy.findStepHeading().should('contain.text', text);
});

Cypress.Commands.add('clickContinue', () => {
  cy.contains('button', 'Continue').click();
});

// --- Step fillers ----------------------------------------------------------

Cypress.Commands.add('fillStep1', ({
  loanType, amount, tenure, purpose,
}) => {
  cy.get(`input[name="loanType"][value="${loanType}"]`).check({ force: true });
  cy.get('input[name="loanAmount"]').clear().type(`${amount}`);
  cy.get('select[name="loanTenure"]').select(`${tenure}`);
  cy.get('select[name="loanPurpose"]').select(purpose);
});

Cypress.Commands.add('fillStep2', (d) => {
  cy.get('input[name="fullName"]').clear().type(d.fullName);
  cy.get('input[name="dob"]').clear().type(d.dob);
  cy.get(`input[name="gender"][value="${d.gender}"]`).check({ force: true });
  cy.get('select[name="maritalStatus"]').select(d.maritalStatus);
  cy.get('input[name="fatherName"]').clear().type(d.fatherName);
  cy.get('input[name="motherName"]').clear().type(d.motherName);
  cy.get('input[name="email"]').clear().type(d.email);
  cy.get('input[name="mobile"]').clear().type(d.mobile);
});

Cypress.Commands.add('fillStep3', ({ pan, aadhaar }) => {
  cy.get('input[name="pan"]').clear().type(pan).blur();
  cy.get('input[name="aadhaar"]').clear().type(aadhaar).blur();
  cy.get('input[name="aadhaarConsent"]').check({ force: true });
  // Wait out the 1.5s simulated PAN/Aadhaar verification.
  cy.wait(1800);
});

Cypress.Commands.add('fillStep4', (d) => {
  cy.get('input[name="currentAddressLine1"]').clear().type(d.line1);
  cy.get('input[name="pinCode"]').clear().type(d.pin);
  cy.wait(800); // PIN lookup auto-fills city/state
  cy.get('select[name="residenceType"]').select(d.residenceType);
  cy.get('input[name="yearsAtCurrentAddress"]').clear().type(`${d.years}`);
});

Cypress.Commands.add('fillStep5Salaried', (d) => {
  cy.get('input[name="employmentType"][value="salaried"]').check({ force: true });
  cy.get('input[name="companyName"]').clear().type(d.companyName);
  cy.get('input[name="designation"]').clear().type(d.designation);
  cy.get('input[name="monthlyNetSalary"]').clear().type(`${d.monthlyNetSalary}`);
  cy.get('input[name="yearsOfExperience"]').clear().type(`${d.yearsOfExperience}`);
});

Cypress.Commands.add('fillStep5Business', (d) => {
  cy.get('input[name="employmentType"][value="business-owner"]').check({ force: true });
  cy.get('input[name="businessName"]').clear().type(d.businessName);
  cy.get('select[name="businessType"]').select(d.businessType);
  cy.get('input[name="annualTurnover"]').clear().type(`${d.annualTurnover}`);
  cy.get('input[name="yearsInBusiness"]').clear().type(`${d.yearsInBusiness}`);
  cy.get('input[name="gstNumber"]').clear().type(d.gstNumber);
  cy.get('textarea[name="officeAddress"]').clear().type(d.officeAddress);
  cy.get('input[name="yearsOfExperience"]').clear().type(`${d.yearsOfExperience}`);
});

Cypress.Commands.add('fillCoApplicant', (d) => {
  cy.get('input[name="coApplicantName"]').clear().type(d.name);
  cy.get('select[name="coApplicantRelationship"]').select(d.relationship);
  cy.get('input[name="coApplicantPan"]').clear().type(d.pan).blur();
  cy.get('input[name="coApplicantIncome"]').clear().type(`${d.income}`);
  cy.get('input[name="coApplicantConsent"]').check({ force: true });
  cy.wait(1800);
});

Cypress.Commands.add('uploadDoc', (label, fixture) => {
  cy.get(`input[aria-label="Upload ${label}"]`).selectFile(`cypress/fixtures/${fixture}`, { force: true });
});

Cypress.Commands.add('drawSignature', () => {
  cy.get('canvas')
    .first()
    .trigger('pointerdown', { x: 30, y: 40, force: true })
    .trigger('pointermove', { x: 90, y: 70, force: true })
    .trigger('pointermove', { x: 150, y: 30, force: true })
    .trigger('pointerup', { force: true });
});

Cypress.Commands.add('checkConsents', () => {
  ['confirmAccurate', 'consentCredit', 'consentTerms', 'consentComms'].forEach((name) => {
    cy.get(`input[name="${name}"]`).check({ force: true });
  });
});
