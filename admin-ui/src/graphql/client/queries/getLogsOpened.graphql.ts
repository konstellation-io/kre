import gql from 'graphql-tag';

export interface GetLogTabs {
  logsOpened: boolean;
}

export const GET_LOGS_OPENED = gql`
  {
    logsOpened @client
  }
`;
