import { loader } from 'graphql.macro';

const GetUserActivityQuery = loader(
  '../Graphql/queries/getUserActivity.graphql'
);
const GetDomainsQuery = loader('../Graphql/queries/getDomains.graphql');
const GetExpTimeQuery = loader('../Graphql/queries/getExpirationTime.graphql');
const UpdateSessionLifetimeMutation = loader(
  '../Graphql/mutations/updateVersionConfiguration.graphql'
);
const UpdateDomainsMutation = loader(
  '../Graphql/mutations/updateDomains.graphql'
);

export const domainMock = {
  request: {
    query: GetDomainsQuery
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
    query: GetUserActivityQuery
  },
  result: {
    data: {
      userActivityList: [
        {
          user: { email: 'user1@domain.com' },
          type: 'LOGIN',
          vars: [],
          date: '2019-11-28T15:28:01+00:00'
        },
        {
          user: { email: 'user2@domain.com' },
          type: 'LOGIN',
          vars: [],
          date: '2019-11-27T15:28:01+00:00'
        },
        {
          user: { email: 'user3@domain.com' },
          type: 'LOGIN',
          vars: [],
          date: '2019-11-26T15:28:01+00:00'
        }
      ]
    }
  }
};

export const expirationTimeMock = {
  request: {
    query: GetExpTimeQuery
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
    query: UpdateDomainsMutation,
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

export const updateExpirationTime = {
  request: {
    query: UpdateSessionLifetimeMutation,
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
