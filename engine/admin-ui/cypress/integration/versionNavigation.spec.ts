import GetMeQuery from "Mocks/GetMeQuery";
import GetVersionConfStatusQuery from "Mocks/GetVersionConfStatusQuery";
import GetConfigurationVariablesQuery from "Mocks/GetConfigurationVariablesQuery";

describe('Version Navigation', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    cy.kstInterceptor('GetVersionConfStatus', { data: GetVersionConfStatusQuery });
    cy.visit('http://dev-admin.kre.local:3000/versions');
  });

  it('should show version on versions list', () => {
    cy.getByTestId('projectsList').should('contain', 'versionName');
  });

  it('should navigate to version', () => {
    cy.getByTestId('projectsList').first().click();
    cy.getByTestId('versionSidebar').should('contain', 'versionName');
  });

  it('should navigate to version predictions page', () => {
    cy.kstInterceptor('GetMetrics', {}, { fixture: 'metrics.json' });
    cy.getByTestId('projectsList').first().click();
    cy.contains('PREDICTIONS').click();
    cy.getByTestId('metricsPanel').should('exist');
  });

  it('should navigate to version configuration page', () => {
    cy.kstInterceptor('GetConfigurationVariables', {
      data: GetConfigurationVariablesQuery,
    });
    cy.getByTestId('projectsList').first().click();
    cy.contains('CONFIGURATION').click();
    cy.getByTestId('versionConfigPanel').should('contain', 'Configuration');
  });
});
