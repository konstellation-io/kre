import CalendarIcon from '@material-ui/icons/Today';
import EmailIcon from '@material-ui/icons/Email';
import { GetVersionConfStatus_versions } from 'Graphql/queries/types/GetVersionConfStatus';
import { Link } from 'react-router-dom';
import ROUTE from 'Constants/routes';
import React from 'react';
import TimeIcon from '@material-ui/icons/AccessTime';
import { VersionStatus } from 'Graphql/types/globalTypes';
import { buildRoute } from 'Utils/routes';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
import styles from './VersionInfo.module.scss';

type Props = {
  version: GetVersionConfStatus_versions;
};
function VersionInfo({ version }: Props) {
  const isPublishedVersion = version.status === VersionStatus.PUBLISHED;
  const hasErrors = version.status === VersionStatus.ERROR;

  const versionPath = buildRoute(ROUTE.VERSION_STATUS, version.id);

  const errors = version.errors.map((error: string, index: number) => (
    <p key={index} className={styles.versionError}>
      {error}
    </p>
  ));
  return (
    <Link to={versionPath}>
      <div className={styles.container} id={`versionInfoElement_${version.id}`}>
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
          {hasErrors && (
            <>
              <p className={styles.descriptionTitle}>ERRORS</p>
              <div>{errors}</div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default VersionInfo;
