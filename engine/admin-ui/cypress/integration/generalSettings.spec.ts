import GetMeQuery from "../../src/Mocks/GetMeQuery";
import GetVersionConfStatusQuery from "../../src/Mocks/GetVersionConfStatusQuery";
import GetSettingsQuery from "../../src/Mocks/GetSettingsQuery";
import UpdateSettingsQuery from "../../src/Mocks/UpdateSettingsQuery";
import GetDomainsQuery from "../../src/Mocks/GetDomainsQuery";
import UpdateDomainsQuery from "../../src/Mocks/UpdateDomainsQuery";

describe('Settings', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    cy.kstInterceptor('GetVersionConfStatus', { data: GetVersionConfStatusQuery });
    cy.kstInterceptor('GetVersionConfStatus', { data: GetVersionConfStatusQuery });
    cy.kstInterceptor('GetSettings', { data: GetSettingsQuery });
  });

  describe('General Settings', () => {
    beforeEach(() => {
      cy.visit('http://dev-admin.kre.local:3000/');
      cy.getByTestId('settings-label').click();
      cy.contains('SETTINGS').click();
    });

    it('should show version on versions list', () => {
      cy.url().should('contain', '/settings/general');
    });

    it('should change session expiration time', () => {
      cy.kstInterceptor('UpdateSettings', { data: UpdateSettingsQuery });
      cy.getByTestId('input').clear().type('60');
      cy.contains('SAVE CHANGES').click();
      cy.contains('CONTINUE').click();
      cy.getByTestId('input').should('have.value', '60');
    });
  });

  describe('Security Settings', () => {
    beforeEach(() => {
      cy.kstInterceptor('GetDomains', { data: GetDomainsQuery });
      cy.kstInterceptor('UpdateDomains', { data: UpdateDomainsQuery });
      cy.visit('http://dev-admin.kre.local:3000/settings/general');
      cy.getByTestId('settings-label').click();
      cy.contains('SECURITY').click();
    });

    it('should navigate to security settings', () => {
      cy.kstInterceptor('GetDomains', { data: GetDomainsQuery });
      cy.url().should('contain', '/settings/security');
    });

    it('should add a new domain', () => {
      const newDomain = 'www.test-domain.com';
      cy.getByTestId('input').clear().type(newDomain);
      cy.contains('ADD DOMAIN').click();
      cy.contains(newDomain).should('exist');
    });

    it('should fail when trying to add an invalid domain', () => {
      cy.getByTestId('input').clear().type('invalid-domain');
      cy.contains('ADD DOMAIN').click();
      cy.getByTestId('input').parent().should('contain','Invalid domain format');
    });
  });
});
