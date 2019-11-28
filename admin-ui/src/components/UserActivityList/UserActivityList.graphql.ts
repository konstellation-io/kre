import gql from 'graphql-tag';
import { UserActivity } from '../../graphql/models';

export interface UserActivityResponse {
  usersActivity: UserActivity[];
}

export const GET_USERS_ACTIVITY = gql`
  query GetUsersActivity {
    usersActivity {
      user {
        email
      }
      message
      date
    }
  }
`;
