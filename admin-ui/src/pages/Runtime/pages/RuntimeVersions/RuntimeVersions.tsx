import { get } from 'lodash';

import React, { useRef } from 'react';

import PublishedVersionStatus from './components/PublishedVersionStatus/PublishedVersionStatus';
import VersionInfo from './components/VersionInfo/VersionInfo';
import Modal from '../../../../components/Modal/Modal';
import ROUTE from '../../../../constants/routes';

import { Version, VersionStatus, Runtime } from '../../../../graphql/models';

import styles from './RuntimeVersions.module.scss';

type Props = {
  runtime: Runtime;
  versions: Version[];
};

function RuntimeVersions({ runtime, versions }: Props) {
  let hasVersions = versions.length > 0;
  let publishedVersion: Version | undefined = versions.find(
    version => version.status === VersionStatus.PUBLISHED
  );

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
      <VersionInfo
        key={`version_${idx}`}
        version={version}
        even={idx % 2 !== 0}
      />
    ));

    return (
      <>
        <PublishedVersionStatus publishedVersion={publishedVersion} />
        <div className={styles.versionList}>{versionsComponents}</div>
      </>
    );
  }

  return (
    <div className={styles.content}>
      {hasVersions && (
        <>
          <h2>Versions of runtime {runtime.name}</h2>
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
