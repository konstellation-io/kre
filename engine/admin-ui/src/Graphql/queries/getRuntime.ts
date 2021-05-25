import { gql } from '@apollo/client';

export default gql`
  query GetRuntime {
    runtime {
      id
      name
    }
  }
`;
