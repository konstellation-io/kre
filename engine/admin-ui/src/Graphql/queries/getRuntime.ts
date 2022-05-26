import { gql } from '@apollo/client';

export default gql`
  query GetRuntime($runtimeId: ID!) {
    runtime(id: $runtimeId) {
      id
      name
    }
  }
`;
