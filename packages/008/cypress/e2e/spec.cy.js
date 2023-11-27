/* eslint-disable cypress/no-unnecessary-waiting */

const TEST_NUMBER = Cypress.env('TEST_NUMBER');
const TRANSFER_NUMBER = Cypress.env('TRANSFER_NUMBER');

beforeEach(() => {
  cy.visit('/');

  cy.get('[data-testid="Settings"]').type('config2.json');
  cy.get('[data-testid="settingsAccept"]').click();
});

describe('Outbound Call test', () => {
  it('no input does nothing', () => {
    cy.get('[data-testid="callButton"]').click();
  });

  it('Wrong input does nothing', () => {
    cy.get('[data-testid="dialerTextInput"]').type('000');
    cy.get('[data-testid="callButton"]').click();
  });

  it('Calls number and hangs', () => {
    cy.get('[data-testid="dialerTextInput"]').type(TEST_NUMBER);
    cy.get('[data-testid="callButton"]').click();

    cy.wait(1000);
    cy.get('[data-testid="hangupButton"]').click();
  });

  it('VideoCall number and hangs', () => {
    cy.get('[data-testid="dialerTextInput"]').type(TEST_NUMBER);
    cy.get('[data-testid="videoCallButton"]').click();

    cy.wait(1000);
    cy.get('[data-testid="hangupButton"]').click();
  });

  it('Call number and blind transfer', () => {
    cy.get('[data-testid="dialerTextInput"]').type(TEST_NUMBER);
    cy.get('[data-testid="videoCallButton"]').click();

    cy.wait(1000);
    cy.get('[data-testid="blindTransferButton"]').click();

    cy.get('[data-testid="transferDialerdialerTextInput"]').type(
      TRANSFER_NUMBER
    );
    cy.get('[data-testid="transferButton"]').click();
  });
});
