import React from 'react';

import PublishedVersionStatus from './components/PublishedVersionStatus/PublishedVersionStatus';
import VersionInfo from './components/VersionInfo/VersionInfo';

import { Version, VersionStatus, Runtime } from '../../../../graphql/models';

import styles from './RuntimeVersions.module.scss';

type Props = {
  runtime: Runtime;
  versions: Version[];
};

function RuntimeVersions({ runtime, versions }: Props) {
  const noVersions = versions.length === 0;
  const nPublishedVersions: number = versions.filter(
    version => version.status === VersionStatus.PUBLISHED
  ).length;

  const versionsComponents = versions.map((version: Version, idx: number) => (
    <VersionInfo key={`version_${idx}`} version={version} />
  ));

  return (
    <div className={styles.content}>
      <h2>Versions of runtime {runtime.name}</h2>
      <p className={styles.subtitle}>
        Here you can see all the versions from the opened runtime. Click on any
        version to open it or add a new version by clicking on the 'ADD NEW
        VERSION' button
      </p>
      <PublishedVersionStatus
        noVersions={noVersions}
        nPublishedVersions={nPublishedVersions}
      />
      <div className={styles.versionList}>{versionsComponents}</div>
    </div>
  );
}

export default RuntimeVersions;
