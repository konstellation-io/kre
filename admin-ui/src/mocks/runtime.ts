import { loader } from 'graphql.macro';

const GetRuntimesQuery = loader('../graphql/queries/getRuntimes.graphql');
const CreateRuntimeMutation = loader(
  '../graphql/mutations/createRuntime.graphql'
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
          status: 'STARTED',
          creationDate: '2019-11-28T15:28:01+00:00',
          publishedVersion: {
            status: 'STARTED'
          }
        },
        {
          id: '00002',
          name: 'Some Other Name',
          status: 'STARTED',
          creationDate: '2019-11-27T15:28:01+00:00',
          publishedVersion: {
            status: 'STARTED'
          }
        },
        {
          id: '00003',
          name: 'Creating runtime',
          status: 'CREATING',
          creationDate: '2019-11-27T15:28:01+00:00',
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
