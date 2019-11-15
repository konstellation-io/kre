import gql from 'graphql-tag';

export const GET_USERNAME = gql`
  query GetUserName {
    me {
      email
    }
  }
`;
