import React from 'react';
import { Version } from '../../../../../graphql/models';
import cx from 'classnames';
import styles from './VersionInfo.module.scss';

type VersionListItemProps = {
  version: Version;
};

function VersionInfo({ version }: VersionListItemProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.name}>
        <div className={cx(styles.circle, styles[version.status])}></div>
        <div>{version.name}</div>
      </div>
      <div>
        <div className={styles.desc}>{version.description}</div>
      </div>
    </div>
  );
}

export default VersionInfo;
