import React from 'react';
import { useParams } from 'react-router';
import * as ROUTE from '../../../../constants/routes';

import Modal from '../../../../components/Modal/Modal';
import { useQuery } from '@apollo/react-hooks';
import {
  GET_VERSIONS,
  RuntimeVersionsResponse,
  RuntimeVersionsVars
} from '../RuntimeVersions/RuntimeVersions.graphql';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import { Version, VersionStatus } from '../../../../graphql/models';
import { useHistory } from 'react-router-dom';

function RuntimeStatus() {
  const history = useHistory();
  const { runtimeId } = useParams();
  const { data, loading, error } = useQuery<
    RuntimeVersionsResponse,
    RuntimeVersionsVars
  >(GET_VERSIONS, {
    variables: { runtimeId },
    fetchPolicy: 'no-cache'
  });
  if (loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  let activeVersion: Version | undefined;
  let hasVersions = data && data.versions.length > 0;
  if (data && hasVersions) {
    activeVersion = data.versions.find(
      version => version.status === VersionStatus.ACTIVE
    );
  }

  if (activeVersion) {
    const path = ROUTE.RUNTIME_STATUS_PREVIEW.replace(
      ':runtimeId',
      runtimeId || ''
    ).replace(':versionId', activeVersion.id || '');
    history.replace(path);

    return null;
  }

  let modal;
  if (!hasVersions) {
    modal = (
      <Modal
        title="THERE ARE NO RUNTIME VERSIONS"
        message="Please, upload a new version to start working on this runtime"
        actionButtonLabel="NEW VERSION"
        to={ROUTE.NEW_VERSION.replace(':runtimeId', runtimeId || '')}
      />
    );
  } else {
    modal = (
      <Modal
        title="THERE IS NO ACTIVE VERSION"
        message="In this page you will see the status of the active version. Please, go to the versions page in order to set the active version."
        actionButtonLabel="VERSIONS"
        to={ROUTE.RUNTIME_VERSIONS.replace(':runtimeId', runtimeId || '')}
      />
    );
  }

  return <>{modal}</>;
}

export default RuntimeStatus;
