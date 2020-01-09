import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router';
import * as PAGES from '../../constants/routes';

import { formatDate } from '../../utils/format';

import { getVersionActionButtons } from '../../pages/Runtime/utils/generators';
import EmailIcon from '@material-ui/icons/Email';
import TimeIcon from '@material-ui/icons/AccessTime';
import CalendarIcon from '@material-ui/icons/Today';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

import useVersionAction from '../../pages/Runtime/utils/hooks';
import { Version, VersionStatus } from '../../graphql/models';

import cx from 'classnames';
import styles from './VersionInfo.module.scss';

type Props = {
  version: Version;
};
function VersionInfo({ version }: Props) {
  const history = useHistory();
  const { runtimeId } = useParams();
  const redirectionPath = PAGES.RUNTIME_VERSIONS.replace(
    ':runtimeId',
    runtimeId || ''
  );
  const {
    activateVersion,
    deployVersion,
    stopVersion,
    deactivateVersion,
    getMutationVars
  } = useVersionAction(redirectionPath);
  const [showActionConfirmation, setShowActionConfirmation] = useState(false);

  const isVersionActive = version.status === VersionStatus.ACTIVE;

  function onVersionClick() {
    const versionStatusPreviewPath = PAGES.RUNTIME_VERSION_STATUS.replace(
      ':runtimeId',
      runtimeId || ''
    ).replace(':versionId', version.id);

    history.push(versionStatusPreviewPath);
  }

  function onActivateVersion(comment: string) {
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

  const versionIsConfigured = version.configurationCompleted;
  const actionButtons = getVersionActionButtons(
    onOpenModal,
    onDeployVersion,
    onStopVersion,
    onDeactivateVersion,
    version.status
  );

  return (
    <>
      <div
        className={cx(styles.container)}
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
            {versionIsConfigured ? (
              <div className={styles.actionButtons}>{actionButtons}</div>
            ) : (
              <div className={styles.versionConf}>Version not configured</div>
            )}
          </div>
        </div>
        <div className={styles.col2}>
          <p className={styles.name}>{version.description}</p>
          <p className={styles.version}>{`VERSION ${version.name}`}</p>
          <p className={styles.descriptionTitle}>DESCRIPTION</p>
          <p className={styles.description}>{version.description}</p>
          {isVersionActive && (
            <>
              <p className={styles.activatedTitle}>ACTIVATED BY</p>
              <div className={styles.activatedContainer}>
                <div className={styles.col2CreatorName}>
                  <EmailIcon className="icon-small" />
                  <span className={styles.activatedAuthor}>
                    {version.activationAuthor.email}
                  </span>
                </div>
                <div className={styles.col2CreationDate}>
                  <TimeIcon className="icon-small" />
                  <span className={styles.activatedDate}>
                    {version.activationDate}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {showActionConfirmation && (
        <ConfirmationModal
          title="YOU ARE ABOUT TO ACTIVATE A VERSION"
          message="And this cannot be undone. Are you sure?"
          onAction={onActivateVersion}
          onClose={onCloseModal}
        />
      )}
    </>
  );
}

export default VersionInfo;
