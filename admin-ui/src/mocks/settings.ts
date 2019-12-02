import {
  GET_DOMAINS,
  GET_EXPIRATION_TIME,
  UPDATE_SESSION_LIFETIME,
  UPDATE_DOMAINS
} from '../pages/Settings/Settings.graphql';
import { GET_USERS_ACTIVITY } from '../pages/UsersActivity/components/UserActivityList/UserActivityList.graphql';

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
          type: 'LOGIN',
          date: '2019-11-28T15:28:01+00:00'
        },
        {
          user: { email: 'user2@domain.com' },
          message: 'some message 2',
          type: 'LOGIN',
          date: '2019-11-27T15:28:01+00:00'
        },
        {
          user: { email: 'user3@domain.com' },
          message: 'some message 3',
          type: 'LOGIN',
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
        sessionLifetimeInDays: 45
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
    query: UPDATE_SESSION_LIFETIME,
    variables: { input: { sessionLifetimeInDays: 10 } }
  },
  result: {
    data: {
      setSettings: {
        settings: {
          sessionLifetimeInDays: 12
        }
      }
    }
  }
};
