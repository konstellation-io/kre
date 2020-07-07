/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {PublishVersionInput, VersionStatus} from '../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: PublishVersion
// ====================================================

export interface PublishVersion_publishVersion_publicationAuthor {
  __typename: 'User';
  email: string;
  id: string;
}

export interface PublishVersion_publishVersion {
  __typename: 'Version';
  id: string;
  status: VersionStatus;
  publicationAuthor: PublishVersion_publishVersion_publicationAuthor | null;
}

export interface PublishVersion {
  publishVersion: PublishVersion_publishVersion;
}

export interface PublishVersionVariables {
  input: PublishVersionInput;
}
