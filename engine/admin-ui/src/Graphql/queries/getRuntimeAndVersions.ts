import { gql } from '@apollo/client';

export default gql`
  query GetVersionConfStatus {
    runtime {
      id
      name
      description
      creationDate
      measurementsUrl
      databaseUrl
      entrypointAddress
    }

    versions {
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
