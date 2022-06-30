import { gql } from '@apollo/client';

export default gql`
  query GetServerLogs(
    $runtimeId: ID!
    $filters: LogFilters!
    $cursor: String
  ) {
    logs(filters: $filters, runtimeId: $runtimeId, cursor: $cursor) {
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
