import { gql } from '@apollo/client';

export default gql`
  subscription GetLogs($filters: LogFilters!, $runtimeId: ID!, $versionName: String!) {
    watchNodeLogs(filters: $filters, runtimeId: $runtimeId, versionName: $versionName) {
      id
      date
      nodeId
      nodeName
      workflowId
      workflowName
      message
      level
    }
  }
`;
