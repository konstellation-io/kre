  import GetMeQuery from "Mocks/GetMeQuery";
  import GetVersionConfStatusQuery from "Mocks/GetVersionConfStatusQuery";
  import GetRuntimes from "../../src/Mocks/GetRuntimesQuery";

  describe('Runtime Creation', () => {
    beforeEach(() => {
      cy.kstInterceptor('GetMe', {data: GetMeQuery});
      cy.kstInterceptor('GetVersionConfStatus', {data: GetVersionConfStatusQuery});
      cy.kstInterceptor('GetRuntimes', {data: GetRuntimes });
      cy.visit('http://dev-admin.kre.local:3000/new-runtime');
    });

    const runtimeId = GetRuntimes.runtimes[0].id;
    const runtimeName = GetRuntimes.runtimes[0].name;
    const runtimeDescription = GetRuntimes.runtimes[0].description;

    it('should navigate to runtime page on creation', () => {
      cy.kstInterceptor('CreateRuntime', {data: { createRuntime: GetRuntimes.runtimes[0] } });

      cy.getByTestId('runtimeCreationInputs').find('input').eq(0).type(runtimeName);
      cy.getByTestId('runtimeCreationInputs').find('input').eq(1).type(runtimeId);
      cy.getByTestId('runtimeCreationInputs').find('textarea').eq(0).type(runtimeDescription);
      cy.contains('SAVE').click()

      cy.url().should('equal', 'http://dev-admin.kre.local:3000/');
    });
  });
