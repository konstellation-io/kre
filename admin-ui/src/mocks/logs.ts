import { GET_LOG_PANEL_CONF } from '../graphql/client/queries/getLogs.graphql';

export const currentLogPanelMock = {
  request: {
    query: GET_LOG_PANEL_CONF
  },
  result: {
    data: {
      runtimeId: 'runtimeIdMock',
      nodeId: 'nodeIdMock',
      nodeName: 'nodeNameMock'
    }
  }
};
