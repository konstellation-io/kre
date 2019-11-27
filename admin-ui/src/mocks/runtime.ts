import { GET_DASHBOARD } from '../pages/Dashboard/Dashboard.graphql';
import { ADD_RUNTIME } from '../pages/AddRuntime/AddRuntime.graphql';

export const dashboardMock = {
  request: {
    query: GET_DASHBOARD
  },
  result: {
    data: {
      dashboard: {
        runtimes: [
          {
            id: '00001',
            status: 'ACTIVE',
            name: 'Some Name',
            creationDate: '2018-01-02'
          },
          {
            id: '00002',
            status: 'ACTIVE',
            name: 'Some Other Name',
            creationDate: '2018-02-03'
          }
        ],
        alerts: [
          {
            id: 'id0',
            type: 'error',
            message: 'some message',
            runtime: { id: '00001' }
          },
          {
            id: 'id1',
            type: 'error',
            message: 'some message 2',
            runtime: { id: '00001' }
          }
        ]
      }
    }
  }
};

export const addRuntimeMock = {
  request: {
    query: ADD_RUNTIME,
    variables: { name: 'New Runtime' }
  },
  result: {
    data: {
      createRuntime: {
        success: true,
        message: 'some message'
      }
    }
  }
};
