import gql from 'graphql-tag';
import { User } from '../../graphql/models';

export interface GetUserEmailResponse {
  me: User;
}

export const GET_USER_EMAIL = gql`
  query GetUserEmail {
    me {
      email
    }
  }
`;
