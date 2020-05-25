import gql from 'graphql-tag';

export interface GetOpenedVersionInfo_openedVersion {
  runtimeName: string;
  versionName: string;
}

export interface GetOpenedVersionInfo {
  openedVersion: GetOpenedVersionInfo_openedVersion;
}

export const GET_OPENED_VERSION_INFO = gql`
  {
    openedVersion @client {
      runtimeName
      versionName
    }
  }
`;
