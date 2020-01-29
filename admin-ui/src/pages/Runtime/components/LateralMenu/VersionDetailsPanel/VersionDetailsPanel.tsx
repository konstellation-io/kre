import React, { useState } from 'react';
import { buildRoute } from '../../../../../utils/routes';
import EmailIcon from '@material-ui/icons/Email';
import TimeIcon from '@material-ui/icons/AccessTime';
import { Runtime, Version, VersionStatus } from '../../../../../graphql/models';
import * as PAGES from '../../../../../constants/routes';
import history from '../../../../../history';
import cx from 'classnames';
import styles from './VersionDetailsPanel.module.scss';
import { getVersionActionButtons } from '../../../utils/generators';
import useVersionAction from '../../../utils/hooks';
import ConfirmationModal from '../../../../../components/ConfirmationModal/ConfirmationModal';
import Button from '../../../../../components/Button/Button';

type VersionDetailsPanelProps = {
  runtime: Runtime;
  version: Version;
  isVersionOpened?: boolean;
  setOpenedVersion: Function;
};

function VersionDetailsPanel({
  runtime,
  version,
  isVersionOpened,
  setOpenedVersion
}: VersionDetailsPanelProps) {
  const [showActionConfirmation, setShowActionConfirmation] = useState(false);

  const versionStatusUrl = buildRoute.version(
    PAGES.RUNTIME_VERSION_STATUS,
    runtime.id,
    version.id
  );
  const versionConfUrl = buildRoute.version(
    PAGES.RUNTIME_VERSION_CONFIGURATION,
    runtime.id,
    version.id
  );

  const {
    publishVersion,
    startVersion,
    stopVersion,
    unpublishVersion,
    getMutationVars
  } = useVersionAction();

  const actionButtons = getVersionActionButtons(
    onOpenModal,
    onStartVersion,
    onStopVersion,
    onUnpublishVersion,
    version.status
  );
  const isVersionPublished = version.status === VersionStatus.PUBLISHED;

  function onPublishVersion(comment: string) {
    setShowActionConfirmation(false);
    publishVersion(getMutationVars(version.id, comment));
  }

  function onUnpublishVersion() {
    unpublishVersion(getMutationVars(version.id));
  }

  function onStartVersion() {
    startVersion(getMutationVars(version.id));
  }

  function onStopVersion() {
    stopVersion(getMutationVars(version.id));
  }

  function onOpenModal(event: any) {
    event.stopPropagation();
    setShowActionConfirmation(true);
  }

  function onCloseModal() {
    setShowActionConfirmation(false);
  }

  function onOpenBtnClick() {
    history.push(versionStatusUrl);
    closeVersionDetailsPanel();
  }

  function closeVersionDetailsPanel() {
    setOpenedVersion(undefined);
  }

  function onWrapperClick(e: React.MouseEvent) {
    // This prevents that the version details panel is closed clicking inside the panel
    e.stopPropagation();
  }

  return (
    <div className={styles.wrapper} onClick={onWrapperClick}>
      <div className={styles.topContainer}>
        <div className={cx(styles.circle, styles[version.status])}></div>
        <div className={cx(styles.status, styles[version.status])}>
          {version.status}
        </div>
        {version.configurationCompleted && (
          <div className={styles.actionButtons}>{actionButtons}</div>
        )}
      </div>
      {!version.configurationCompleted && (
        <div className={styles.versionConf}>
          <div className={styles.versionConfText}>
            This version is not configured.
          </div>
          <div className={styles.versionConfButton}>
            <Button
              label="CONFIGURE IT NOW"
              border
              style={{ borderColor: '#ea4747' }}
              height={32}
              to={versionConfUrl}
            />
          </div>
        </div>
      )}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>VERSION NAME</div>
        <div className={styles.versionName}>{version.name}</div>
      </div>
      {version.description && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>DESCRIPTION</div>
          <div className={styles.versionDesc}>{version.description}</div>
        </div>
      )}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>CREATED BY</p>
        <div className={styles.authorDateContainer}>
          <div className={styles.col2CreatorName}>
            <EmailIcon className="icon-small" />
            <span className={styles.author}>
              {version.creationAuthor.email}
            </span>
          </div>
          <div className={styles.col2CreationDate}>
            <TimeIcon className="icon-small" />
            <span className={styles.date}>{version.creationDate}</span>
          </div>
        </div>
      </div>
      {isVersionPublished && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>PUBLISHED BY</p>
          <div className={styles.authorDateContainer}>
            <div className={styles.col2CreatorName}>
              <EmailIcon className="icon-small" />
              <span className={styles.author}>
                {version.publicationAuthor.email}
              </span>
            </div>
            <div className={styles.col2CreationDate}>
              <TimeIcon className="icon-small" />
              <span className={styles.date}>{version.publicationDate}</span>
            </div>
          </div>
        </div>
      )}
      {!isVersionOpened && (
        <div className={styles.sectionBtns}>
          <Button label="OPEN" primary height={32} onClick={onOpenBtnClick} />
        </div>
      )}

      {showActionConfirmation && (
        <ConfirmationModal
          title="YOU ARE ABOUT TO PUBLISH A VERSION"
          message="And this cannot be undone. Are you sure?"
          onAction={onPublishVersion}
          onClose={onCloseModal}
        />
      )}
    </div>
  );
}

export default VersionDetailsPanel;
