import React from 'react';
import { useParams } from 'react-router';
import * as ROUTE from '../../../../constants/routes';

import Modal from '../../../../components/Modal/Modal';
import Spinner from '../../../../components/Spinner/Spinner';
import ActiveVersionStatus from './ActiveVersionStatus';
import VersionInfo from '../../../../components/VersionInfo/VersionInfo';

import {
  GET_VERSIONS,
  RuntimeVersionsData,
  RuntimeVersion
} from './dataModels';
import { useQuery } from '@apollo/react-hooks';

import styles from './RuntimeVersions.module.scss';

function RuntimeVersions() {
  const { runtimeId } = useParams();
  const { data, loading, error } = useQuery<RuntimeVersionsData>(GET_VERSIONS, {
    variables: { runtimeId }
  });

  if (loading) return <Spinner />;
  if (error) return <div>'ERROR'</div>;

  let activeVersion: RuntimeVersion;
  if (data && data.versions.length !== 0) {
    // @ts-ignore
    activeVersion = data.versions.find(version => version.status === 'active');
    console.log('VERSIONS', data.versions);
    console.log('ACTIVE VERSION', activeVersion);
  }

  function onLocateActiveVersionClick() {
    // `versionInfoElement_${version.description.replace(' ', '')}`
  }

  function getContent() {
    if (data && data.versions.length === 0) {
      return (
        <Modal
          title="THERE IS NO RUNTIME VERSIONS"
          message="Please, upload a new version to start working on this runtime"
          actionButtonLabel="NEW VERSION"
          to={ROUTE.NEW_VERSION}
        />
      );
    }

    const versions =
      data &&
      data.versions.map((version: RuntimeVersion, idx: number) => (
        <VersionInfo
          key={`version_${idx}`}
          version={version}
          focussed={version.status === 'active'}
        />
      ));

    return (
      <>
        <ActiveVersionStatus
          activeVersion={activeVersion}
          onClick={onLocateActiveVersionClick}
        />
        <div className={styles.versionList}>{versions}</div>
      </>
    );
  }

  return (
    <div className={styles.content}>
      <h2>Versions</h2>
      <p className={styles.subtitle}>
        Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec
        viverra eleifend lacus, vitae ullamcorper metus. Sed sollicitudin ipsum
        quis nunc sollicitudin ultrices. Donec euismod scelerisque ligula.
        Maecenas eu varius risus, eu aliquet arcu. Curabitur fermentum suscipit
        est, tincidunt.
      </p>
      {getContent()}
    </div>
  );
}

export default RuntimeVersions;
