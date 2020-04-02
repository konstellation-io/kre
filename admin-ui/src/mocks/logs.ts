import { GET_LOGS } from '../graphql/client/queries/getLogs.graphql';

export const currentLogPanelMock = {
  request: {
    query: GET_LOGS
  },
  result: {
    data: {
      runtimeId: 'runtimeIdMock',
      nodeId: 'nodeIdMock',
      nodeName: 'nodeNameMock'
    }
  }
};
