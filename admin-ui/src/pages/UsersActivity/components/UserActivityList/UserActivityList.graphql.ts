import gql from 'graphql-tag';
import { UserActivity } from '../../../../graphql/models';

export interface UserActivityResponse {
  userActivityList: UserActivity[];
}

export const GET_USERS_ACTIVITY = gql`
  query GetUsersActivity {
    userActivityList {
      user {
        email
      }
      date
      type
      vars {
        key
        value
      }
    }
  }
`;
