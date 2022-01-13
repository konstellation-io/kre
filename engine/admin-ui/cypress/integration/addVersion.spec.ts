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

  it('should fail if krt is not attached', () => {
    cy.getByTestId('createVersion').children().first().click();
    cy.getByTestId('uploadVersion').should('contain', 'This field is mandatory');
  });

  xit('should work if krt is attached', () => {
    cy.kstInterceptor('CreateVersion', {
      data: {
        createVersion: {
          name:"greeter-v5",
          description:"Version for testing.",
          id: "61deb868ccbb9f8d0c105861",
          status:"CREATING",
          creationDate:"2022-01-12T11:15:52Z",
          creationAuthor: {
            id:"kre_admin_user",
            email:"dev@local.local",
            __typename:"User"
          },
          __typename:"Version"
        }
      }
    });
    //
    // cy.kstInterceptor('GetVersionConfStatus', {
    //   data:{
    //     createVersion:{
    //       id:"61deb868ccbb9f8d0c105861",
    //       name:"greeter-v5",
    //       description:"Version for testing.",
    //       status:"CREATING",
    //       creationDate:"2022-01-12T11:15:52Z",
    //       creationAuthor:{
    //         id:"kre_admin_user",
    //         email:"dev@local.local",
    //         __typename:"User"
    //       },
    //       __typename:"Version"
    //     }
    //   }
    // });
    cy.get('input').attachFile('greeter-v1.krt');
    cy.getByTestId('createVersion').children().first().click();
    cy.wait(50000)
    cy.url().should('include', '/versions');
  });
});
