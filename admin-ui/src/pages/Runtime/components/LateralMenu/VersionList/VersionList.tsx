import React from 'react';
import { Version } from '../../../../../graphql/models';

import VersionListItem from '../VersionListItem/VersionListItem';

import styles from './VersionList.module.scss';

type VersionListProps = {
  label: string;
  versions: Version[];
  openedVersion?: Version;
  setOpenedVersion: (v: Version) => void;
};

function VersionList({
  label,
  versions,
  openedVersion,
  setOpenedVersion
}: VersionListProps) {
  const versionItems = versions.map((v: Version) => (
    <VersionListItem
      key={v.id}
      version={v}
      selected={openedVersion ? v.id === openedVersion.id : false}
      onSelect={setOpenedVersion}
    />
  ));

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>{label}</div>
      <div className={styles.items}>{versionItems}</div>
    </div>
  );
}

export default VersionList;
