Cypress.Commands.add('kstInterceptor', (operation, responseObject, options): Chainable => (
  cy.intercept('/graphql', (req) => {
    const { operationName } = req.body;
    if (operationName !== operation) return;
    if (options) {
      req.reply(options);
      return;
    }
    req.reply(responseObject);
  })
));
import Chainable = Cypress.Chainable;

Cypress.Commands.add('getByTestId', (dataTestId) => cy.get(`[data-testid="${dataTestId}"]`));

Cypress.Commands.add('findByTestId', { prevSubject: true }, (subject: Chainable<any>, dataTestId) =>
  subject.find(`[data-testid="${dataTestId}"]`),
);
