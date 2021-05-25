import { gql } from '@apollo/client';

export default gql`
  query GetMetrics(
    $versionName: String!
    $startDate: String!
    $endDate: String!
  ) {
    metrics(
      versionName: $versionName
      startDate: $startDate
      endDate: $endDate
    ) {
      values {
        accuracy {
          total
          micro
          macro
          weighted
        }
        missing
        newLabels
      }
      charts {
        confusionMatrix {
          x
          y
          z
        }
        seriesAccuracy {
          x
          y
        }
        seriesRecall {
          x
          y
        }
        seriesSupport {
          x
          y
        }
        successVsFails {
          x
          y
        }
      }
    }
  }
`;
