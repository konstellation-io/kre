import gql from 'graphql-tag';

export const GET_USERS_ACTIVITY = gql`
  query GetUsersActivity {
    usersActivity {
      user
      message
      date
    }
  }
`;

export type UserActivity = {
  user: string;
  message: string;
  date: any;
};

export function formatUserActivity(userActivity: any) {
  return {
    user: userActivity.user,
    message: userActivity.message,
    date: userActivity.date
  } as UserActivity;
}
