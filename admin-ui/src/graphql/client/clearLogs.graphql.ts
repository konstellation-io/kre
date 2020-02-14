import gql from 'graphql-tag';

export const CLEAR_LOGS = gql`
  {
    clearLogs @client
  }
`;
