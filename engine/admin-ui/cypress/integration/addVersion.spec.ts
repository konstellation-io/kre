import GetMeQuery from '../../src/Mocks/GetMeQuery';
import GetVersionConfStatusQuery from '../../src/Mocks/GetVersionConfStatusQuery';
import 'cypress-file-upload';

describe('Add Version Behavior', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetMe', { data: GetMeQuery });
    cy.kstInterceptor('GetVersionConfStatus', { data: GetVersionConfStatusQuery });
    cy.visit('http://dev-admin.kre.local:3000/new_version');
  });

  it('should show add version page', () => {
    cy.url().should('include', 'new_version');
  });

  it('should fail if file is not attached', () => {
    cy.getByTestId('createVersion').children().first().click();
    cy.getByTestId('uploadVersion').should('contain', 'This field is mandatory');
  });

  it('should fail if the file attached is not a .krt', () => {
    cy.get('input').attachFile('metrics.json');
    cy.getByTestId('createVersion').children().first().click();
    cy.getByTestId('uploadVersion').should('contain', 'Must be a .krt file');
  });
});
