import { get, sortBy } from 'lodash';

import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as ROUTE from '../../../../constants/routes';

import Modal from '../../../../components/Modal/Modal';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import ActiveVersionStatus from './ActiveVersionStatus';
import VersionInfo from '../../../../components/VersionInfo/VersionInfo';

import { useQuery } from '@apollo/react-hooks';
import {
  GET_VERSIONS,
  RuntimeVersionsResponse,
  RuntimeVersionsVars
} from './RuntimeVersions.graphql';
import { Version, VersionStatus } from '../../../../graphql/models';

import styles from './RuntimeVersions.module.scss';

function RuntimeVersions() {
  const versionListRef = useRef(null);
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

  let hasVersions = data && data.versions.length > 0;
  let activeVersion: Version | undefined =
    data &&
    data.versions.find(version => version.status === VersionStatus.ACTIVE);

  function onLocateActiveVersionClick() {
    const activeVersionInfoElement = document.getElementById(
      `versionInfoElement_${activeVersion && activeVersion.id}`
    );

    let scrollAmount = 0;

    const targetTop = activeVersionInfoElement
      ? activeVersionInfoElement.offsetTop
      : 0;

    const listTop: number = get(versionListRef, 'current.offsetTop') || 0;
    scrollAmount = targetTop - listTop;

    // @ts-ignore
    versionListRef.current.scrollTo({
      top: scrollAmount,
      behavior: 'smooth'
    });
  }

  function getContent() {
    if (data && data.versions.length === 0 && runtimeId) {
      const toRoute = ROUTE.NEW_VERSION.replace(':runtimeId', runtimeId);

      return (
        <Modal
          title="THERE IS NO RUNTIME VERSIONS"
          message="Please, upload a new version to start working on this runtime"
          actionButtonLabel="NEW VERSION"
          to={toRoute}
        />
      );
    }

    const sortedVersionsData = sortBy(get(data, 'versions', []), [
      'creationDate'
    ]).reverse() as Version[];
    const versions = sortedVersionsData.map((version: Version, idx: number) => (
      <VersionInfo key={`version_${idx}`} version={version} />
    ));

    return (
      <>
        <ActiveVersionStatus
          activeVersion={activeVersion}
          onClick={onLocateActiveVersionClick}
        />
        <div className={styles.versionList} ref={versionListRef}>
          {versions}
        </div>
      </>
    );
  }

  return (
    <div className={styles.content}>
      {hasVersions && (
        <>
          <h2>Versions</h2>
          <p className={styles.subtitle}>
            Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec
            viverra eleifend lacus, vitae ullamcorper metus. Sed sollicitudin
            ipsum quis nunc sollicitudin ultrices. Donec euismod scelerisque
            ligula. Maecenas eu varius risus, eu aliquet arcu. Curabitur
            fermentum suscipit est, tincidunt.
          </p>
        </>
      )}

      {getContent()}
    </div>
  );
}

export default RuntimeVersions;
