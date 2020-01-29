import gql from 'graphql-tag';
import { Alert, Runtime } from '../../graphql/models';

export interface GetDashboardResponse {
  runtimes: Runtime[];
  alerts: Alert[];
}

export const GET_DASHBOARD = gql`
  query GetDashboard {
    runtimes {
      id
      name
      status
      creationDate
      publishedVersion {
        status
      }
    }
    alerts {
      type
      message
      runtime {
        id
      }
    }
  }
`;
