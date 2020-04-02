import gql from 'graphql-tag';

export const GET_LOGS_OPENED = gql`
  {
    logsOpened @client
  }
`;
