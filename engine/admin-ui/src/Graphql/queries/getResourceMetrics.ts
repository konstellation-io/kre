import { gql } from '@apollo/client';

export default gql`
  query GetResourceMetrics(
    $versionName: String!
    $fromDate: String!
    $toDate: String!
  ) {
    resourceMetrics(
      versionName: $versionName
      fromDate: $fromDate
      toDate: $toDate
    ) {
      date
      cpu
      mem
    }
  }
`;
