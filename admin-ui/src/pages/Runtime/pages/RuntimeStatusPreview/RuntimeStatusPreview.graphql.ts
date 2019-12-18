import gql from 'graphql-tag';
import { Version } from '../../../../graphql/models';

export interface ActivateVersionResponse {
  activateVersion: Version;
}

export interface DeployVersionResponse {
  deployVersion: Version;
}

export interface ActivateDeployVersionVars {
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

export const DEPLOY_VERSION = gql`
  mutation DeployVersion($input: DeployVersionInput!) {
    deployVersion(input: $input) {
      id
    }
  }
`;
