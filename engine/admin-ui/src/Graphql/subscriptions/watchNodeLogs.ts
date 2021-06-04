import { gql } from '@apollo/client';

export default gql`
  subscription GetLogs($filters: LogFilters!, $versionName: String!) {
    watchNodeLogs(filters: $filters, versionName: $versionName) {
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
