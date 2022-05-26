import { gql } from '@apollo/client';

export default gql`
  query GetUsersActivity(
    $userEmail: String
    $fromDate: String
    $toDate: String
    $types: [UserActivityType!]
    $versionIds: [String!]
    $lastId: String
  ) {
    userActivityList(
      userEmail: $userEmail
      fromDate: $fromDate
      toDate: $toDate
      types: $types
      versionIds: $versionIds
      lastId: $lastId
    ) {
      id
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
