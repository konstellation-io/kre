import GetMeQuery from "Mocks/GetMeQuery";
import GetVersionConfStatusQuery from "Mocks/GetVersionConfStatusQuery";
import { users } from "Mocks/users";
import CreateUserQuery from "Mocks/CreateUserQuery";

describe('Users Page', () => {
  beforeEach(() => {
    cy.kstInterceptor('GetMe', {data: GetMeQuery});
    cy.kstInterceptor('GetVersionConfStatus', {data: GetVersionConfStatusQuery});
    cy.kstInterceptor('GetUsers', { data: { users } });
    cy.visit('http://dev-admin.kre.local:3000/');
    cy.getByTestId('settings-label').click();
    cy.contains('USERS').click();
  });

  it('should navigate to users page', () => {
    cy.url().should('contain', '/users');
  });

  it('should create new user', () => {
    cy.kstInterceptor('CreateUser', { data: CreateUserQuery });
    cy.contains('NEW USER').click();
    cy.getByTestId('input').type('newuser@test.com');
    cy.contains('SAVE').click();
    cy.get('table').should('contain', 'newuser@test.com');
  });

  it('should create new user', () => {
    cy.kstInterceptor('CreateUser', { data: CreateUserQuery });
    cy.contains('NEW USER').click();
    cy.getByTestId('input').type('invalid email');
    cy.contains('SAVE').click();
    cy.getByTestId('input').parent().should('contain', 'Invalid email address');
  });

  it('should delete user', () => {
    cy.kstInterceptor('RemoveUsers', {
      data: {
        removeUsers: [
          users[0],
        ]
      },
    });
    cy.get('tr').eq(1).get('td').last().click();
    cy.contains('delete').click();
    cy.getByTestId('input').type('test');
    cy.contains('REMOVE 1 USER').click();
    cy.get('table').should('not.contain', users[0]);
  });
});
