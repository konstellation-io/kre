import gql from 'graphql-tag';
import { UserActivity } from '../../graphql/models';

export interface UserActivityResponse {
  userActivityList: UserActivity[];
}

export const GET_USERS_ACTIVITY = gql`
  query GetUsersActivity(
    $userEmail: String
    $fromDate: String
    $toDate: String
    $type: UserActivityType
  ) {
    userActivityList(
      userEmail: $userEmail
      fromDate: $fromDate
      toDate: $toDate
      type: $type
    ) {
      user {
        email
      }
      message
      date
      type
    }
  }
`;
