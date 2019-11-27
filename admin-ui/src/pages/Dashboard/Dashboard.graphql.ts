import gql from 'graphql-tag';
import { Dashboard, Runtime } from '../../graphql/models';

export interface GetRuntimesResponse {
  runtimes: Runtime[];
}

export const GET_RUNTIMES = gql`
  query GetRuntimes {
    runtimes {
      id
      name
      status
      creationDate
    }
  }
`;

export interface GetDashboardResponse {
  dashboard: Dashboard;
}

export const GET_DASHBOARD = gql`
  query GetDashboard {
    dashboard {
      runtimes {
        id
        name
        status
        creationDate
      }
      alerts {
        type
        message
        runtime {
          id
        }
      }
    }
  }
`;
