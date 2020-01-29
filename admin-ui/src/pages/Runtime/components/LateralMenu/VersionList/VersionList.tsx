import React from 'react';
import { Version } from '../../../../../graphql/models';

import VersionListItem from '../VersionListItem/VersionListItem';

import styles from './VersionList.module.scss';
import Button from '../../../../../components/Button/Button';
import { ADD_VERSION } from '../../../../AddVersion/AddVersion.graphql';
import { NEW_VERSION } from '../../../../../constants/routes';

type VersionListProps = {
  runtimeId: string;
  versions: Version[];
  openedVersion?: Version;
  setOpenedVersion: (v: Version) => void;
};

function VersionList({
  runtimeId,
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

  const numVersions = versions.length;

  const newVersionRoute = NEW_VERSION.replace(':runtimeId', runtimeId || '');

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <span>{numVersions} versions shown</span>
        <Button label="ADD" to={newVersionRoute} />
      </div>
      <div className={styles.items}>{versionItems}</div>
    </div>
  );
}

export default VersionList;
