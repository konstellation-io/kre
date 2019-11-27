import gql from 'graphql-tag';

export interface UserActivity {
  user: string;
  message: string;
  date: string;
}

export interface UserActivityResponse {
  usersActivity: UserActivity[];
}

export const GET_USERS_ACTIVITY = gql`
  query GetUsersActivity {
    usersActivity {
      user
      message
      date
    }
  }
`;
