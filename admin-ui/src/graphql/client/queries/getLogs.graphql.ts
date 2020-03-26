import gql from 'graphql-tag';

export const GET_LOGS = gql`
  {
    logs @client {
      date
      nodeName
      message
      level
    }
  }
`;
