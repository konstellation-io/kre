import React from 'react';
import { useHistory, useParams } from 'react-router';
import ROUTE from '../../../../../../constants/routes';

import { formatDate } from '../../../../../../utils/format';
import { buildRoute } from '../../../../../../utils/routes';

import EmailIcon from '@material-ui/icons/Email';
import TimeIcon from '@material-ui/icons/AccessTime';
import CalendarIcon from '@material-ui/icons/Today';

import { GetVersionConfStatus_versions } from '../../../../../../graphql/queries/types/GetVersionConfStatus';
import { VersionStatus } from '../../../../../../graphql/types/globalTypes';

import cx from 'classnames';
import styles from './VersionInfo.module.scss';

type Props = {
  version: GetVersionConfStatus_versions;
};
function VersionInfo({ version }: Props) {
  const history = useHistory();
  const { runtimeId } = useParams();

  const isPublishedVersion = version.status === VersionStatus.PUBLISHED;

  function onVersionClick() {
    const versionStatusPreviewPath = buildRoute.version(
      ROUTE.RUNTIME_VERSION_STATUS,
      runtimeId,
      version.id
    );

    history.push(versionStatusPreviewPath);
  }

  return (
    <>
      <div
        className={styles.container}
        id={`versionInfoElement_${version.id}`}
        onClick={onVersionClick}
      >
        <div className={styles.col1}>
          <div className={styles.labelContainer}>
            <div className={cx(styles.label, styles[version.status])}>
              {version.status}
            </div>
          </div>
          <div className={styles.actionsContainer}>
            <div className={styles.creation}>
              <CalendarIcon className="icon-small" />
              <p className={styles.creationDate}>
                {`CREATED: ${formatDate(new Date(version.creationDate))}`}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.col2}>
          <p className={styles.version}>{`VERSION ${version.name}`}</p>
          {version.description && (
            <p className={styles.descriptionTitle}>DESCRIPTION</p>
          )}
          <p className={styles.description}>{version.description}</p>
          {isPublishedVersion && (
            <>
              <p className={styles.activatedTitle}>PUBLISHED BY</p>
              <div className={styles.activatedContainer}>
                <div className={styles.col2CreatorName}>
                  <EmailIcon className="icon-small" />
                  <span className={styles.activatedAuthor}>
                    {version &&
                      version.publicationAuthor &&
                      version.publicationAuthor.email}
                  </span>
                </div>
                <div className={styles.col2CreationDate}>
                  <TimeIcon className="icon-small" />
                  <span className={styles.activatedDate}>
                    {version.publicationDate}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default VersionInfo;
