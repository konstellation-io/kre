import { runtime, version } from './version';

import { loader } from 'graphql.macro';

const GetRuntimesQuery = loader('Graphql/queries/getRuntimes.graphql');
const GetRuntimeAndVersionQuery = loader(
  'Graphql/queries/getRuntimeAndVersions.graphql'
);
const CreateRuntimeMutation = loader('Graphql/mutations/createRuntime.graphql');
const RuntimeCreatedSubscription = loader(
  'Graphql/subscriptions/runtimeCreated.graphql'
);

export const dashboardMock = {
  request: {
    query: GetRuntimesQuery
  },
  result: {
    data: {
      runtimes: [
        {
          id: '00001',
          name: 'Some Name',
          description: 'Some Description',
          status: 'STARTED',
          creationDate: '2019-11-28T15:28:01+00:00',
          creationAuthor: { email: 'some@user.com' },
          publishedVersion: {
            status: 'STARTED'
          }
        },
        {
          id: '00002',
          name: 'Some Other Name',
          description: 'Some Other Description',
          status: 'STARTED',
          creationDate: '2019-11-27T15:28:01+00:00',
          creationAuthor: { email: 'some@user.com' },
          publishedVersion: {
            status: 'STARTED'
          }
        },
        {
          id: '00003',
          name: 'Creating runtime',
          description: 'Some Description',
          status: 'CREATING',
          creationDate: '2019-11-27T15:28:01+00:00',
          creationAuthor: { email: 'some@user.com' },
          publishedVersion: {
            status: 'CREATING'
          }
        }
      ]
    }
  }
};

export const dashboardErrorMock = {
  request: {
    query: GetRuntimesQuery
  },
  error: new Error('cannot get runtimes')
};

export const addRuntimeMock = {
  request: {
    query: CreateRuntimeMutation,
    variables: { input: { name: 'New Runtime' } }
  },
  result: {
    data: {
      createRuntime: { name: 'some name' }
    }
  }
};

export const getRuntimeAndVersionsMock = {
  request: {
    query: GetRuntimeAndVersionQuery
  },
  result: {
    data: {
      runtime,
      version
    }
  }
};

export const getRuntimeAndVersionsErrorMock = {
  request: {
    query: GetRuntimeAndVersionQuery
  },
  error: new Error('cannot get runtime and versions')
};

export const runtimeCreatedMock = {
  request: {
    query: RuntimeCreatedSubscription
  },
  result: {
    data: {
      runtimeCreated: { id: 'some id', name: 'some name' }
    }
  }
};
