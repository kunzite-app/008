/* eslint-disable cypress/no-unnecessary-waiting */

const TEST_NUMBER = '007';
const TRANSFER_NUMBER = '008';

beforeEach(() => {
  cy.visit('/');

  cy.get('[data-testid="Settings"]').type('cfgDemo008.json');
  cy.get('[data-testid="settingsAccept"]').click();
  cy.wait(2000);
});

describe('Outbound Call test', () => {
  it('no input does nothing', () => {
    cy.get('[data-testid="callButton"]').click();
  });

  it('Calls number and hangs', () => {
    cy.get('[data-testid="dialerTextInput"]').type(TEST_NUMBER);
    cy.get('[data-testid="callButton"]').click();

    cy.wait(1000);
    cy.get('[data-testid="hangupButton"]').click();
  });

  it('Call number and blind transfer', () => {
    cy.get('[data-testid="dialerTextInput"]').type(TEST_NUMBER);
    cy.get('[data-testid="callButton"]').click();

    cy.wait(1000);
    cy.get('[data-testid="blindTransferButton"]').click();

    cy.get('[data-testid="transferDialerdialerTextInput"]').type(
      TRANSFER_NUMBER
    );
    cy.get('[data-testid="transferButton"]').click();
  });

  it('VideoCall number and hangs', () => {
    cy.get('[data-testid="dialerTextInput"]').type(TEST_NUMBER);
    cy.get('[data-testid="videoCallButton"]').click();

    cy.wait(1000);
    cy.get('[data-testid="hangupButton"]').click();
  });
});
