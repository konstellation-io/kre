import { runtime, version } from './version';
import GetRuntimesQuery from 'Graphql/queries/getRuntimes';
import CreateRuntimeMutation from 'Graphql/mutations/createRuntime';

import GetRuntimeAndVersionQuery from 'Graphql/queries/getRuntimeAndVersions';

export const runtimeAndVersions = {
  runtime,
  versions: [version, version]
};
export const getRuntimeAndVersionsMock = {
  request: {
    query: GetRuntimeAndVersionQuery
  },
  result: {
    data: runtimeAndVersions
  }
};

export const getRuntimeAndVersionsErrorMock = {
  request: {
    query: GetRuntimeAndVersionQuery
  },
  error: new Error('cannot get runtime and versions')
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
