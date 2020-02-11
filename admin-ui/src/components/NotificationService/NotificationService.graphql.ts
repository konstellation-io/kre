import gql from 'graphql-tag';

export const GET_LOGIN_STATUS = gql`
  {
    loggedIn @client
  }
`;
