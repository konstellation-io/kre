import {
  GET_DOMAINS,
  GET_EXPIRATION_TIME,
  UPDATE_COOKIE_EXP_TIME,
  UPDATE_DOMAINS
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
          user: { email: 'user1@domain.com' },
          message: 'some message 1',
          date: '2019-11-28T15:28:01+00:00'
        },
        {
          user: { email: 'user2@domain.com' },
          message: 'some message 2',
          date: '2019-11-27T15:28:01+00:00'
        },
        {
          user: { email: 'user3@domain.com' },
          message: 'some message 3',
          date: '2019-11-26T15:28:01+00:00'
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
    query: UPDATE_DOMAINS,
    variables: {
      input: {
        authAllowedDomains: [
          'domain.1',
          'domain.2',
          'domain.3.sample',
          'intelygenz.com'
        ]
      }
    }
  },
  result: {
    data: {
      updateSettings: {
        settings: {
          authAllowedDomains: [
            'domain.1',
            'domain.2',
            'domain.3.sample',
            'intelygenz.com'
          ]
        }
      }
    }
  }
};

export const updateExpirationTime = {
  request: {
    query: UPDATE_COOKIE_EXP_TIME,
    variables: { input: { cookieExpirationTime: 10 } }
  },
  result: {
    data: {
      setSettings: {
        settings: {
          cookieExpirationTime: 12
        }
      }
    }
  }
};
