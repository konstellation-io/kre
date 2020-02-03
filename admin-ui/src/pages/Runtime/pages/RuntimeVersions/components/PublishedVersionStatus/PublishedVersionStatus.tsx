import React from 'react';
import ROUTE from '../../../../../../constants/routes';
import { useParams } from 'react-router';

import Button from '../../../../../../components/Button/Button';
import { formatDate } from '../../../../../../utils/format';

import Check from '@material-ui/icons/Check';
import ErrorOutline from '@material-ui/icons/ErrorOutline';

import { Version } from '../../../../../../graphql/models';

import cx from 'classnames';
import styles from '../../RuntimeVersions.module.scss';

type Props = {
  publishedVersion?: Version;
};
function PublishedVersionStatus({ publishedVersion }: Props) {
  const { runtimeId } = useParams();
  const isVersionActive = publishedVersion !== undefined;
  const title = isVersionActive
    ? 'Version published'
    : 'There is no published version';
  const Icon = isVersionActive ? Check : ErrorOutline;

  const newVersionRoute = ROUTE.NEW_VERSION.replace(
    ':runtimeId',
    runtimeId || ''
  );

  return (
    <div
      className={cx(styles.activeVersion, {
        [styles['active']]: isVersionActive
      })}
    >
      <Icon className="icon-regular" />
      <span className={styles.versionTitle}>{title}</span>
      {isVersionActive && publishedVersion && (
        <>
          <span className={styles.versionCreation}>
            {`CREATED: ${formatDate(new Date(publishedVersion.creationDate))}`}
          </span>
          <div className={styles.secondRow}>
            <div className={styles.versionStatus}>
              <div className={styles.greenCircle} />
              <span className={styles.versionName}>
                {publishedVersion.name}
              </span>
            </div>
            <Button label="ADD NEW VERSION" to={newVersionRoute} border />
          </div>
        </>
      )}
    </div>
  );
}

export default PublishedVersionStatus;
