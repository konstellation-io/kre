import GetMeQuery from '../../src/Mocks/GetMeQuery';
import GetVersionConfStatusQuery from '../../src/Mocks/GetVersionConfStatusQuery';

describe('Add Version Behavior', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    cy.kstInterceptor('GetVersionConfStatus', { data: GetVersionConfStatusQuery });
    cy.visit('http://dev-admin.kre.local:3000/new_version');
  });

  it('should show add version page', () => {
    cy.url().should('include', 'new_version');
  });

  it('should fail if krt is not attached', () => {
    cy.getByTestId('createVersion').children().first().click();
    cy.getByTestId('uploadVersion').should('contain', 'This field is mandatory');
  });
});
