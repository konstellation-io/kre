import {GET_RUNTIMES} from '../pages/Dashboard/dataModel';
import {ADD_RUNTIME} from '../pages/AddRuntime/dataModels';

export const runtimeMock = {
  request: {
    query: GET_RUNTIMES,
  },
  result: {
    data: {
      runtimes: [
        {id: '00001', status: 'ACTIVE', name: 'Some Name', creationDate: '2018-01-02'},
        {id: '00002', status: 'ACTIVE', name: 'Some Other Name', creationDate: '2018-02-03'},
      ],
    },
  },
};

export const addRuntimeMock = {
  request: {
    query: ADD_RUNTIME,
    variables: { name: 'New Runtime' },
  },
  result: {
    data: {
      addRuntime: {
        success: true,
        message: 'some message'
      }
    },
  },
};
