import { GET_USER_EMAIL } from '../components/Header/Header.graphql';

export const usernameMock = {
  request: {
    query: GET_USER_EMAIL
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
    query: GET_USER_EMAIL
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
