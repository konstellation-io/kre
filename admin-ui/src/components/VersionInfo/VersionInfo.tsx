import React from 'react';

import Button from '../Button/Button';
import { formatDate } from '../../utils/format';

import Check from '@material-ui/icons/Check';
import EmailIcon from '@material-ui/icons/Email';
import TimeIcon from '@material-ui/icons/AccessTime';
import CalendarIcon from '@material-ui/icons/Today';

import { RuntimeVersion } from '../../pages/Runtime/pages/RuntimeVersions/dataModels';

import cx from 'classnames';
import styles from './VersionInfo.module.scss';

type Props = {
  version: RuntimeVersion;
  focussed?: boolean;
};
function VersionInfo({ version, focussed = false }: Props) {
  const isVersionActive = version.status === 'active';

  return (
    <div
      className={cx(styles.container, {
        [styles.focussed]: focussed
      })}
      id={`versionInfoElement_${version.description.replace(' ', '')}`}
    >
      <div className={styles.col1}>
        <div className={styles.creation}>
          <CalendarIcon style={{ fontSize: '0.8rem' }} />
          <p className={styles.creationDate}>
            {`CREATED: ${formatDate(new Date(version.creationDate))}`}
          </p>
        </div>
        {isVersionActive ? (
          <div className={styles.createdPanel}>
            <Check style={{ fontSize: '2rem' }} />
            <p className={styles.versionActive}>Version active</p>
          </div>
        ) : (
          <div className={styles.actionButton}>
            <Button label="PREVIEW" border />
          </div>
        )}
        <div></div>
      </div>
      <div className={styles.col2}>
        <div className={styles.statusLine} />
        <div className={styles.statusCircle} />
      </div>
      <div className={styles.col3}>
        <p className={styles.name}>{version.description}</p>
        <p className={styles.version}>{`VERSION ${version.versionNumber}`}</p>
        <p className={styles.descriptionTitle}>DESCRIPTION</p>
        <p className={styles.description}>{version.description}</p>
        {isVersionActive && (
          <>
            <p className={styles.activatedTitle}>ACTIVATED BY</p>
            <div className={styles.activatedContainer}>
              <div className={styles.col3CreatorName}>
                <EmailIcon style={{ fontSize: '0.8rem' }} />
                <span className={styles.activatedAuthor}>
                  {version.activatorName}
                </span>
              </div>
              <div className={styles.col3CreationDate}>
                <TimeIcon style={{ fontSize: '0.8rem' }} />
                <span className={styles.activatedDate}>
                  {version.activationDate}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VersionInfo;
