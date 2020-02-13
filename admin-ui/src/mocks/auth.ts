import { loader } from 'graphql.macro';

const GetUserEmailQuery = loader('../graphql/queries/getUserEmail.graphql');

export const usernameMock = {
  request: {
    query: GetUserEmailQuery
  },
  result: {
    data: {
      me: {
        email: 'user@konstellation.com'
      }
    }
  }
};

export const unauthorizedUsernameMock = {
  request: {
    query: GetUserEmailQuery
  },
  result: {
    data: {
      me: {
        email: 'unauthorizedUser@konstellation.com'
      }
    }
  },
  error: new Error('Unauthorized user')
};
