import { gql } from '@apollo/client';

export default gql`
  subscription WatchVersion {
    watchVersion {
      id
      name
      status
      errors
    }
  }
`;
