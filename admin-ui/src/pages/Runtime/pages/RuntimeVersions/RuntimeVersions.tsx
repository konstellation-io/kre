import { get } from 'lodash';

import React, { useRef } from 'react';

import ActiveVersionStatus from './components/ActiveVersionStatus/ActiveVersionStatus';
import VersionInfo from './components/VersionInfo/VersionInfo';
import Modal from '../../../../components/Modal/Modal';
import ROUTE from '../../../../constants/routes';

import { Version, VersionStatus } from '../../../../graphql/models';

import styles from './RuntimeVersions.module.scss';

type Props = {
  versions: Version[];
};

function RuntimeVersions({ versions }: Props) {
  const versionListRef = useRef(null);

  let hasVersions = versions.length > 0;
  let activeVersion: Version | undefined = versions.find(
    version => version.status === VersionStatus.PUBLISHED
  );

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
    if (versions.length === 0) {
      return (
        <Modal
          title="THERE IS NO RUNTIME VERSIONS"
          message="Please, upload a new version to start working on this runtime"
          actionButtonLabel="NEW VERSION"
          to={ROUTE.NEW_VERSION}
        />
      );
    }

    const versionsComponents = versions.map((version: Version, idx: number) => (
      <VersionInfo key={`version_${idx}`} version={version} />
    ));

    return (
      <>
        <ActiveVersionStatus
          activeVersion={activeVersion}
          onClick={onLocateActiveVersionClick}
        />
        <div className={styles.versionList} ref={versionListRef}>
          {versionsComponents}
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
            Here you can see all the versions from the opened runtime. Click on
            any version to open it or add a new version by clicking on the 'ADD
            NEW VERSION' button
          </p>
        </>
      )}

      {getContent()}
    </div>
  );
}

export default RuntimeVersions;
