import { get } from 'lodash';

import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as ROUTE from '../../../../constants/routes';

import Modal from '../../../../components/Modal/Modal';
import Spinner from '../../../../components/Spinner/Spinner';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import ActiveVersionStatus from './ActiveVersionStatus';
import VersionInfo from '../../../../components/VersionInfo/VersionInfo';

import { useQuery } from '@apollo/react-hooks';
import {
  GET_VERSIONS,
  RuntimeVersionsResponse,
  RuntimeVersionsVars
} from './RuntimeVersions.graphql';
import { Version } from '../../../../graphql/models';

import styles from './RuntimeVersions.module.scss';

function RuntimeVersions() {
  const versionListRef = useRef(null);
  const { runtimeId } = useParams();
  const [activeVersionFocussed, setActiveVersionFocussed] = useState(false);
  const { data, loading, error } = useQuery<
    RuntimeVersionsResponse,
    RuntimeVersionsVars
  >(GET_VERSIONS, {
    variables: { runtimeId }
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage />;

  let activeVersion: Version | undefined;
  if (data && data.versions.length !== 0) {
    activeVersion = data.versions.find(version => version.status === 'ACTIVE');
  }

  function onLocateActiveVersionClick() {
    const activeVersionInfoElement = document.getElementById(
      `versionInfoElement_${activeVersion &&
        activeVersion.description.replace(' ', '')}`
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

    setActiveVersionFocussed(true);
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
      data.versions.map((version: Version, idx: number) => (
        <VersionInfo
          key={`version_${idx}`}
          version={version}
          focussed={activeVersionFocussed && version.status === 'ACTIVE'}
        />
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
