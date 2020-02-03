import gql from 'graphql-tag';
import { Version } from '../../../../graphql/models';

export interface PublishVersionResponse {
  publishVersion: Version;
}

export interface UnpublishVersionResponse {
  unpublishVersion: Version;
}

export interface StartVersionResponse {
  startVersion: Version;
}

export interface StopVersionResponse {
  stopVersion: Version;
}

export interface VersionActionVars {
  input: {
    versionId: string;
  };
}

export const PUBLISH_VERSION = gql`
  mutation PublishVersion($input: PublishVersionInput!) {
    publishVersion(input: $input) {
      id
      status
      publicationAuthor {
        email
        id
      }
    }
  }
`;

export const UNPUBLISH_VERSION = gql`
  mutation UnpublishVersion($input: UnpublishVersionInput!) {
    unpublishVersion(input: $input) {
      id
      status
    }
  }
`;

export const START_VERSION = gql`
  mutation StartVersion($input: StartVersionInput!) {
    startVersion(input: $input) {
      id
      status
    }
  }
`;

export const STOP_VERSION = gql`
  mutation StopVersion($input: StopVersionInput!) {
    stopVersion(input: $input) {
      id
      status
    }
  }
`;

export interface GetVersionWorkflowsResponse {
  version: Version;
}

export interface GetVersionWorkflowsVars {
  versionId?: string;
}

export const GET_VERSION_WORKFLOWS = gql`
  query GetVersionWorkflows($versionId: ID!) {
    version(id: $versionId) {
      name
      status
      workflows {
        name
        nodes {
          id
          name
          status
        }
        edges {
          id
          fromNode
          toNode
        }
      }
      configurationCompleted
    }
  }
`;
