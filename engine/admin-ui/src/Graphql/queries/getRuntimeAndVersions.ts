import { gql } from '@apollo/client';

export default gql`
  query GetVersionConfStatus($runtimeId: ID!) {
    runtime(id: $runtimeId) {
      id
      name
      description
      creationDate
      measurementsUrl
      databaseUrl
      entrypointAddress
    }

    versions(runtimeId: $runtimeId) {
      id
      name
      description
      status
      creationDate
      creationAuthor {
        id
        email
      }
      publicationDate
      publicationAuthor {
        id
        email
      }
      config {
        completed
      }
      hasDoc
      errors
    }
  }
`;
