import {
  GET_DOMAINS,
  GET_EXPIRATION_TIME,
  ADD_ALLOWED_DOMAIN,
  UPDATE_EXPIRATION_TIME
} from '../pages/Settings/Settings.graphql';
import { GET_USERS_ACTIVITY } from '../components/UserActivityList/UserActivityList.graphql';

export const domainMock = {
  request: {
    query: GET_DOMAINS
  },
  result: {
    data: {
      settings: {
        authAllowedDomains: ['domain.1', 'domain.2', 'domain.3.sample']
      }
    }
  }
};

export const usersActivityMock = {
  request: {
    query: GET_USERS_ACTIVITY
  },
  result: {
    data: {
      usersActivity: [
        {
          user: 'user1@domain.com',
          message: 'some message 1',
          date: '2019-01-01'
        },
        {
          user: 'user2@domain.com',
          message: 'some message 2',
          date: '2019-01-02'
        },
        {
          user: 'user3@domain.com',
          message: 'some message 3',
          date: '2019-01-03'
        }
      ]
    }
  }
};

export const expirationTimeMock = {
  request: {
    query: GET_EXPIRATION_TIME
  },
  result: {
    data: {
      settings: {
        cookieExpirationTime: 45
      }
    }
  }
};

export const addAllowedDomainMock = {
  request: {
    query: ADD_ALLOWED_DOMAIN,
    variables: { domainName: 'intelygenz.com' }
  },
  result: {
    data: {
      addAllowedDomain: {
        authAllowedDomains: [
          'domain.1',
          'domain.2',
          'domain.3.sample',
          'intelygenz.com'
        ]
      }
    }
  }
};

export const removeAllowedDomainMock = {
  request: {
    query: ADD_ALLOWED_DOMAIN,
    variables: { domainName: 'domain.3.sample' }
  },
  result: {
    data: {
      removeAllowedDomain: {
        authAllowedDomains: ['domain.1', 'domain.2']
      }
    }
  }
};

export const updateExpirationTime = {
  request: {
    query: UPDATE_EXPIRATION_TIME,
    variables: { input: { cookieExpirationTime: 10 } }
  },
  result: {
    data: {
      setSettings: {
        cookieExpirationTime: 12
      }
    }
  }
};
