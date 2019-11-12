import gql from 'graphql-tag';


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

type Runtime = {
  id: string;
  status: string;
  title: string;
  info: {
    type: string;
    date: string;
  }[];
  disbled?: boolean;
};
type Alert = {
  type: string;
  message: string;
  runtimeId: string;
};

export function formatRuntime(runtime:any) {
  return {
    id: runtime.id,
    status: runtime.status,
    title: runtime.name,
    info: [{
      type: 'active',
      date: runtime.creationDate
    }]
  } as Runtime;
}

export function formatAlert(alert:any) {
  return {
    type: alert.type,
    message: alert.message,
    runtimeId: alert.runtime.id
  } as Alert;
}
