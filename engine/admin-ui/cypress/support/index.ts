// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to intercept GraphQl queries from the KDL.
       * @example cy.kstInterceptor('GetMe', {name: 'Jon Doe'})
       */
      kstInterceptor(operation: string, responseObject: Object): Chainable;

      /**
       * Custom command to get element by data-testid
       * @example cy.getByTestId('my-data-testid')
       */
      getByTestId(dataTestId: string): Chainable;

      /**
       * Custom command to find an element by data-testid
       * @example cy.findByTestId('my-data-testid')
       */
      findByTestId(dataTestId: string): Chainable;
    }
  }
}
