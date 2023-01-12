  import GetMeQuery from "Mocks/GetMeQuery";
  import GetVersionConfStatusQuery from "Mocks/GetVersionConfStatusQuery";
  import GetRuntimes from "../../src/Mocks/GetRuntimesQuery";

  describe.only('Runtime Navigation', () => {
    beforeEach(() => {
      cy.kstInterceptor('GetMe', {data: GetMeQuery});
      cy.kstInterceptor('GetVersionConfStatus', {data: GetVersionConfStatusQuery});
      cy.kstInterceptor('GetRuntimes', {data: GetRuntimes });
      cy.visit('http://dev-admin.kre.local:3000/runtimes');
    });

    const runtimeName = GetRuntimes.runtimes[0].name;
    const runtimeId = GetRuntimes.runtimes[0].id;

    it('should show runtimes list', () => {
      cy.getByTestId('runtimesList').should('contain', runtimeName);
    });

    it('should navigate to runtime\'s versions list', () => {
      cy.getByTestId('hexTitle').first().click();
      cy.url().should('contain', runtimeId);
    });

    it('should navigate to runtime\'s creation page', () => {
      cy.contains('ADD RUNTIME').click();
      cy.url().should('contain', 'new-runtime');
    });

    it('should navigate to runtimes list from navigation bar', () => {
      cy.visit('http://dev-admin.kre.local:3000/runtimes/runtime-id/versions')  ;
      cy.getByTestId('navigation-bar').children().first().click();
      cy.getByTestId('runtimesList').should('contain', runtimeName)
      cy.url().should('eq', 'http://dev-admin.kre.local:3000/');
    })
  });
