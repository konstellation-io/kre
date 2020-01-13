import gql from 'graphql-tag';
import { Version } from '../../../../graphql/models';

export interface ActivateVersionResponse {
  activateVersion: Version;
}

export interface DeactivateVersionResponse {
  deactivateVersion: Version;
}

export interface DeployVersionResponse {
  deployVersion: Version;
}

export interface StopVersionResponse {
  stopVersion: Version;
}

export interface VersionActionVars {
  input: {
    versionId: string;
  };
}

export const ACTIVATE_VERSION = gql`
  mutation ActivateVersion($input: ActivateVersionInput!) {
    activateVersion(input: $input) {
      id
    }
  }
`;

export const DEACTIVATE_VERSION = gql`
  mutation DeactivateVersion($input: DeactivateVersionInput!) {
    deactivateVersion(input: $input) {
      id
    }
  }
`;

export const DEPLOY_VERSION = gql`
  mutation DeployVersion($input: DeployVersionInput!) {
    deployVersion(input: $input) {
      id
    }
  }
`;

export const STOP_VERSION = gql`
  mutation StopVersion($input: StopVersionInput!) {
    stopVersion(input: $input) {
      id
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
    }
  }
`;
