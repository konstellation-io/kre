import GetMeQuery from "Mocks/GetMeQuery";
import GetVersionConfStatusQuery from "Mocks/GetVersionConfStatusQuery";
import GetConfigurationVariablesQuery from "Mocks/GetConfigurationVariablesQuery";
import {AccessLevel} from "../../src/Graphql/types/globalTypes";
import GetVersionWorkflowsQuery from "../../src/Mocks/GetVersionWorkflowsQuery";
import GetRuntimes from "../../src/Mocks/GetRuntimesQuery";

describe('Version Navigation', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetMe', {data: GetMeQuery});
    cy.kstInterceptor('GetVersionConfStatus', {data: GetVersionConfStatusQuery});
    cy.kstInterceptor('GetRuntimes', {data: GetRuntimes });
    cy.visit('http://dev-admin.kre.local:3000/runtimes/runtime-id/versions');
  });

  it('should show version on versions list', () => {
    cy.getByTestId('projectsList').should('contain', 'versionName');
  });

  it('should navigate to version', () => {
    cy.getByTestId('projectsList').first().click();
    cy.getByTestId('versionSidebar').should('contain', 'versionName');
  });

  it('should navigate to version predictions page', () => {
    cy.kstInterceptor('GetMetrics', {}, {fixture: 'metrics.json'});
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

  it('should open project logs if the user has viewer role', () => {
    // GIVEN that the user has VIEWER access level
    cy.kstInterceptor('GetMe', {
      data: {
        me: {
          ...GetMeQuery.me,
          accessLevel: AccessLevel.VIEWER,
        }
      }
    });

    // AND a workflow exists
    cy.kstInterceptor('GetVersionWorkflows', { data: GetVersionWorkflowsQuery });
    // AND the user navigates to the version page
    cy.getByTestId('projectsList').first().click();

    // WHEN the user opens the logs console
    cy.getByTestId('openWorkflowLogs').first().click();
    // THEN the logs console opens
    cy.contains('LOGS CONSOLE').should('exist');
    // AND
    // EXPECT - The user viewer has permissions to open the logs console
  });
});
