import React from 'react';
import { Version, Runtime } from '../../../../../graphql/models';

import VersionListItem from './VersionListItem';

import styles from './VersionList.module.scss';

type VersionListProps = {
  versions: Version[];
  detailsVersion?: Version;
  setDetailsVersion: (v: Version) => void;
};

function VersionList({
  versions,
  detailsVersion,
  setDetailsVersion
}: VersionListProps) {
  const numVersions = versions.length;
  const versionItems = versions.map((v: Version) => (
    <VersionListItem
      key={v.id}
      version={v}
      selected={detailsVersion ? v.id === detailsVersion.id : false}
      onSelect={setDetailsVersion}
    />
  ));

  return (
    <div className={styles.wrapper}>
      <div className={styles.desc}>{numVersions} versions shown</div>
      <div className={styles.items}>{versionItems}</div>
    </div>
  );
}

export default VersionList;
