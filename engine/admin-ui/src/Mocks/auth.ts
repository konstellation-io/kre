import { AccessLevel } from 'Graphql/types/globalTypes';

import GetUserEmailQuery from 'Graphql/queries/getMe';

export const usernameMock = {
  request: {
    query: GetUserEmailQuery
  },
  result: {
    data: {
      me: {
        email: 'user@konstellation.com',
        id: 'someId',
        accessLevel: AccessLevel.ADMIN
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
        email: 'unauthorizedUser@konstellation.com',
        id: 'someId',
        accessLevel: AccessLevel.ADMIN
      }
    }
  },
  error: new Error('Unauthorized user')
};
