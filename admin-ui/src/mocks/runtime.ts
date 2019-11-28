import { GET_DASHBOARD } from '../pages/Dashboard/Dashboard.graphql';
import { ADD_RUNTIME } from '../pages/AddRuntime/AddRuntime.graphql';

export const dashboardMock = {
  request: {
    query: GET_DASHBOARD
  },
  result: {
    data: {
      runtimes: [
        {
          id: '00001',
          status: 'ACTIVE',
          name: 'Some Name',
          creationDate: '2019-11-28T15:28:01+00:00'
        },
        {
          id: '00002',
          status: 'ACTIVE',
          name: 'Some Other Name',
          creationDate: '2019-11-27T15:28:01+00:00'
        }
      ],
      alerts: [
        {
          id: 'id0',
          type: 'ERROR',
          message: 'some message',
          runtime: { id: '00001' }
        },
        {
          id: 'id1',
          type: 'ERROR',
          message: 'some message 2',
          runtime: { id: '00001' }
        }
      ]
    }
  }
};

export const addRuntimeMock = {
  request: {
    query: ADD_RUNTIME,
    variables: { input: { name: 'New Runtime' } }
  },
  result: {
    data: {
      createRuntime: {
        errors: [],
        runtime: { name: 'some name' }
      }
    }
  }
};
