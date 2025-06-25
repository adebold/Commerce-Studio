// ***********************************************************
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Preserve cookies between tests
Cypress.Cookies.defaults({
  preserve: ['session_id', 'user_id', 'ab_test_assignments']
});

// Disable screenshots on success
Cypress.Screenshot.defaults({
  screenshotOnRunFailure: true
});

// Log custom messages to the Cypress command log
Cypress.Commands.add('log', (message) => {
  Cypress.log({
    name: 'log',
    displayName: 'LOG',
    message: message
  });
});

// Add custom assertion for checking if an element has a specific class
Cypress.Commands.add('shouldHaveClass', { prevSubject: true }, (subject, className) => {
  cy.wrap(subject).should('have.class', className);
  return cy.wrap(subject);
});

// Add custom assertion for checking if an element is visible in viewport
Cypress.Commands.add('shouldBeInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
  
  return cy.wrap(subject);
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  console.log('Uncaught exception:', err.message);
  return false;
});