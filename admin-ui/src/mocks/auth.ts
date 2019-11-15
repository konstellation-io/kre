import { GET_USERNAME } from '../components/Header/dataModels';

export const usernameMock = {
  request: {
    query: GET_USERNAME
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
    query: GET_USERNAME
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
