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
