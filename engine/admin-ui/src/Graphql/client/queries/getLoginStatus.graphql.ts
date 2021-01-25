import { gql } from '@apollo/client';

export const GET_LOGIN_STATUS = gql`
  {
    loggedIn @client
  }
`;
