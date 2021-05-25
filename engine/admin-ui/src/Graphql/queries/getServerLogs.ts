import { gql } from '@apollo/client';

export default gql`
  query GetServerLogs(
    $versionName: String!
    $filters: LogFilters!
    $cursor: String
  ) {
    logs(filters: $filters, versionName: $versionName, cursor: $cursor) {
      items {
        id
        date
        nodeId
        nodeName
        workflowId
        workflowName
        message
        level
      }
      cursor
    }
  }
`;
