import gql from 'graphql-tag';

export const GET_LOGS = gql`
  {
    logs @client {
      id
      date
      nodeName
      message
      level
    }
    logPanel @client {
      runtimeId
      nodeId
      nodeName
    }
    logsAutoScroll @client
    logsOpened @client
  }
`;
