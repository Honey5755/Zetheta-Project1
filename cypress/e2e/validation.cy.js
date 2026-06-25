/**
 * E2E #4–#8 (P0) — per-step validation: required fields, age bounds,
 * PAN/Aadhaar rules, PIN lookup, and employment sub-form switching (Spec E1).
 */
describe('Step validation', () => {
  let data;
  beforeEach(() => {
    cy.fixture('valid-personal-loan.json').then((d) => { data = d; });
    cy.startApplication();
  });

  it('#4 shows Step 1 errors on empty submit', () => {
    cy.clickContinue();
    cy.contains('Select a loan type to continue').should('be.visible');
  });

  it('#5 enforces the 21–65 age range on Step 2', () => {
    cy.fillStep1(data.step1);
    cy.clickContinue();
    cy.fillStep2(data.step2);
    cy.get('input[name="dob"]').clear().type('2012-01-01'); // ~13 years old
    cy.clickContinue();
    cy.contains('between 21 and 65 years old').should('be.visible');
  });

  it('#6 rejects an invalid PAN entity and a bad Aadhaar checksum', () => {
    cy.fillStep1(data.step1);
    cy.clickContinue();
    cy.fillStep2(data.step2);
    cy.clickContinue();
    cy.get('input[name="pan"]').clear().type('ABCDE1234F').blur(); // 4th char D, not P
    cy.contains('4th character must be P').should('be.visible');
    cy.get('input[name="aadhaar"]').clear().type('234123412345').blur(); // bad checksum
    cy.contains('checksum failed').should('be.visible');
  });

  it('#7 auto-fills city/state from PIN and errors on an unknown PIN', () => {
    cy.fillStep1(data.step1);
    cy.clickContinue();
    cy.fillStep2(data.step2);
    cy.clickContinue();
    cy.fillStep3(data.step3);
    cy.clickContinue();
    cy.get('input[name="pinCode"]').clear().type('560001');
    cy.wait(800);
    cy.get('input[name="city"]').should('have.value', 'Bengaluru');
    cy.get('input[name="pinCode"]').clear().type('999999');
    cy.wait(800);
    cy.contains('PIN code not found').should('be.visible');
  });

  it('#8 switches Step 5 employment sub-forms', () => {
    cy.fillStep1(data.step1);
    cy.clickContinue();
    cy.fillStep2(data.step2);
    cy.clickContinue();
    cy.fillStep3(data.step3);
    cy.clickContinue();
    cy.fillStep4(data.step4);
    cy.clickContinue();

    cy.get('input[name="employmentType"][value="salaried"]').check({ force: true });
    cy.get('input[name="companyName"]').should('exist');
    cy.get('input[name="gstNumber"]').should('not.exist');

    cy.get('input[name="employmentType"][value="business-owner"]').check({ force: true });
    cy.get('input[name="gstNumber"]').should('exist');
    cy.get('input[name="companyName"]').should('not.exist');
  });
});
