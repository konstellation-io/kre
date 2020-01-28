import React, { useState } from 'react';
import EmailIcon from '@material-ui/icons/Email';
import TimeIcon from '@material-ui/icons/AccessTime';
import { Version, Runtime, VersionStatus } from '../../../../../graphql/models';
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

  const versionStatusUrl = PAGES.RUNTIME_VERSION_STATUS.replace(
    ':runtimeId',
    runtime.id
  ).replace(':versionId', version.id);

  const {
    activateVersion,
    deployVersion,
    stopVersion,
    deactivateVersion,
    getMutationVars
  } = useVersionAction();

  const actionButtons = getVersionActionButtons(
    onOpenModal,
    onDeployVersion,
    onStopVersion,
    onDeactivateVersion,
    version.status
  );
  const isVersionActive = version.status === VersionStatus.ACTIVE;

  function onActivateVersion(comment: string) {
    setShowActionConfirmation(false);
    activateVersion(getMutationVars(version.id, comment));
  }
  function onDeactivateVersion() {
    deactivateVersion(getMutationVars(version.id));
  }
  function onDeployVersion() {
    deployVersion(getMutationVars(version.id));
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
        {version.configurationCompleted ? (
          <div className={styles.actionButtons}>{actionButtons}</div>
        ) : (
          <div className={styles.versionConf}>Version not configured</div>
        )}
      </div>
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
      {isVersionActive && (
        <div className={styles.section}>
          <p className={styles.sectionLabel}>ACTIVATED BY</p>
          <div className={styles.authorDateContainer}>
            <div className={styles.col2CreatorName}>
              <EmailIcon className="icon-small" />
              <span className={styles.author}>
                {version.activationAuthor.email}
              </span>
            </div>
            <div className={styles.date}>
              <TimeIcon className="icon-small" />
              <span className={styles.activatedDate}>
                {version.activationDate}
              </span>
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
          title="YOU ARE ABOUT TO ACTIVATE A VERSION"
          message="And this cannot be undone. Are you sure?"
          onAction={onActivateVersion}
          onClose={onCloseModal}
        />
      )}
    </div>
  );
}

export default VersionDetailsPanel;
