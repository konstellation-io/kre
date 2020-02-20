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
          status: 'STARTED',
          name: 'Some Name',
          creationDate: '2019-11-28T15:28:01+00:00'
        },
        {
          id: '00002',
          status: 'STARTED',
          name: 'Some Other Name',
          creationDate: '2019-11-27T15:28:01+00:00'
        }
      ]
    }
  }
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
