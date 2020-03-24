import { GET_CURRENT_LOG_PANEL } from '../graphql/client/queries/getCurrentLogPanel';

export const currentLogPanelMock = {
  request: {
    query: GET_CURRENT_LOG_PANEL
  },
  result: {
    data: {
      runtimeId: 'runtimeIdMock',
      nodeId: 'nodeIdMock',
      nodeName: 'nodeNameMock'
    }
  }
};
