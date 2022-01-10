import Chainable = Cypress.Chainable;
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
Cypress.Commands.add('kstInterceptor', (operation, responseObject): Chainable => (
  cy.intercept('/graphql', (req) => {
    const { operationName } = req.body;
    if (operationName === operation) req.reply(responseObject);
  })
));

Cypress.Commands.add('getByTestId', (dataTestId) => cy.get(`[data-testid="${dataTestId}"]`));

Cypress.Commands.add('findByTestId', { prevSubject: true }, (subject: Chainable<any>, dataTestId) =>
  subject.find(`[data-testid="${dataTestId}"]`),
);
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
