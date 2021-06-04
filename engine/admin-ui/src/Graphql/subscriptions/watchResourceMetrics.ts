import { gql } from '@apollo/client';

export default gql`
  subscription WatchResourceMetrics($versionName: String!, $fromDate: String!) {
    watchResourceMetrics(versionName: $versionName, fromDate: $fromDate) {
      date
      cpu
      mem
    }
  }
`;
