/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {
  UnpublishVersionInput,
  VersionStatus
} from './../../types/globalTypes';

// ====================================================
// GraphQL mutation operation: UnpublishVersion
// ====================================================

export interface UnpublishVersion_unpublishVersion {
  __typename: 'Version';
  id: string;
  status: VersionStatus;
}

export interface UnpublishVersion {
  unpublishVersion: UnpublishVersion_unpublishVersion;
}

export interface UnpublishVersionVariables {
  input: UnpublishVersionInput;
}
