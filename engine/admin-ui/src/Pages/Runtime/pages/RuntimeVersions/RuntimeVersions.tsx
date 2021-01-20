import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';

import { MONORUNTIME_MODE } from 'index';
import PublishedVersionStatus from './components/PublishedVersionStatus/PublishedVersionStatus';
import React from 'react';
import RuntimeInfo from './components/RuntimeInfo/RuntimeInfo';
import { Title } from 'kwc';
import VersionInfo from './components/VersionInfo/VersionInfo';
import { VersionStatus } from 'Graphql/types/globalTypes';
import { sortBy } from 'lodash';
import styles from './RuntimeVersions.module.scss';

const VERSION_SORT_FIELD: keyof GetVersionConfStatus_versions = 'creationDate';

type Props = {
  runtime: GetVersionConfStatus_runtime;
  versions: GetVersionConfStatus_versions[];
};

function RuntimeVersions({ runtime, versions }: Props) {
  const noVersions = versions.length === 0;
  const nPublishedVersions: number = versions.filter(
    version => version.status === VersionStatus.PUBLISHED
  ).length;

  const versionsComponents = sortBy(versions, VERSION_SORT_FIELD)
    .reverse()
    .map((version: GetVersionConfStatus_versions) => (
      <VersionInfo key={version.id} version={version} />
    ));

  const showRuntimeInfo = !MONORUNTIME_MODE;
  return (
    <div className={styles.content}>
      <Title>Versions of runtime {runtime.name}</Title>
      {showRuntimeInfo && <RuntimeInfo runtime={runtime} />}
      <PublishedVersionStatus
        noVersions={noVersions}
        nPublishedVersions={nPublishedVersions}
      />
      <div className={styles.versionList}>{versionsComponents}</div>
    </div>
  );
}

export default RuntimeVersions;
