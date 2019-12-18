import gql from 'graphql-tag';
import { UserActivity } from '../../graphql/models';
import { User } from '../../graphql/models';

export interface GetUsersResponse {
  users: User[];
}

export const GET_USERS = gql`
  query GetUsers {
    users {
      email
    }
  }
`;

export interface UserActivityResponse {
  userActivityList: UserActivity[];
}

export const GET_USERS_ACTIVITY = gql`
  query GetUsersActivity(
    $userEmail: String
    $fromDate: String
    $toDate: String
    $type: UserActivityType
    $lastId: String
  ) {
    userActivityList(
      userEmail: $userEmail
      fromDate: $fromDate
      toDate: $toDate
      type: $type
      lastId: $lastId
    ) {
      id
      user {
        email
      }
      message
      date
      type
    }
  }
`;
