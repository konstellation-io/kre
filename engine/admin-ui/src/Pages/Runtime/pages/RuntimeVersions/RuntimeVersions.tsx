import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';

import React from 'react';
import { InfoMessage, Title } from 'kwc';
import { VersionStatus } from 'Graphql/types/globalTypes';
import VersionsList from './components/VersionsList/VersionsList';
import { sortBy } from 'lodash';
import styles from './RuntimeVersions.module.scss';

const VERSION_SORT_FIELD: keyof GetVersionConfStatus_versions = 'creationDate';

type Props = {
  runtime: GetVersionConfStatus_runtime;
  versions: GetVersionConfStatus_versions[];
};

function RuntimeVersions({ runtime, versions }: Props) {
  const sortedVersions = sortBy(versions, VERSION_SORT_FIELD).reverse();

  const publishedVersions: GetVersionConfStatus_versions[] = [];
  const otherVersions: GetVersionConfStatus_versions[] = [];
  sortedVersions.forEach(version => {
    if (version.status === VersionStatus.PUBLISHED)
      publishedVersions.push(version);
    else otherVersions.push(version);
  });

  function renderVersions() {
    if (!versions.length) {
      return (
        <InfoMessage message="There are no versions available. Update a new one." />
      );
    }

    return (
      <>
        <VersionsList
          title="Published version"
          versions={publishedVersions}
          hideNumberOnTitle
        />
        <VersionsList
          title={publishedVersions.length ? 'Other versions' : 'All versions'}
          versions={otherVersions}
          showAddVersionButton
        />
      </>
    );
  }

  return (
    <div className={styles.content}>
      <Title>Versions of runtime {runtime.name}</Title>
      {renderVersions()}
    </div>
  );
}

export default RuntimeVersions;
