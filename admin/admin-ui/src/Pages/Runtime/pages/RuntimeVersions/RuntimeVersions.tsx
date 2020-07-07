import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';

import IconEmail from '@material-ui/icons/Email';
import IconTime from '@material-ui/icons/AccessTime';
import InfoField from './components/InfoField/InfoField';
import PublishedVersionStatus from './components/PublishedVersionStatus/PublishedVersionStatus';
import React from 'react';
import Title from 'Components/Title/Title';
import VersionInfo from './components/VersionInfo/VersionInfo';
import { VersionStatus } from 'Graphql/types/globalTypes';
import { formatDate } from 'Utils/format';
import styles from './RuntimeVersions.module.scss';

type Props = {
  runtime: GetVersionConfStatus_runtime;
  versions: GetVersionConfStatus_versions[];
};

function RuntimeVersions({ runtime, versions }: Props) {
  const noVersions = versions.length === 0;
  const nPublishedVersions: number = versions.filter(
    version => version.status === VersionStatus.PUBLISHED
  ).length;

  const versionsComponents = versions.map(
    (version: GetVersionConfStatus_versions) => (
      <VersionInfo key={version.id} version={version} />
    )
  );

  return (
    <div className={styles.content}>
      <Title>Versions of runtime {runtime.name}</Title>
      <div className={styles.runtimeInfo}>
        <div className={styles.infoFields}>
          <InfoField
            field="CREATOR"
            Icon={IconEmail}
            value={runtime.creationAuthor.email}
          />
          <InfoField
            field="CREATED"
            Icon={IconTime}
            value={formatDate(new Date(runtime.creationDate), true)}
          />
        </div>
        <p className={styles.description}>{runtime.description}</p>
      </div>
      <PublishedVersionStatus
        noVersions={noVersions}
        nPublishedVersions={nPublishedVersions}
      />
      <div className={styles.versionList}>{versionsComponents}</div>
    </div>
  );
}

export default RuntimeVersions;
