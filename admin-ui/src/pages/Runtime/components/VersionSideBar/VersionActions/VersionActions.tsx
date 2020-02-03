import React, { useState } from 'react';
import { Version, Runtime, VersionStatus } from '../../../../../graphql/models';
import cx from 'classnames';
import styles from './VersionActions.module.scss';

// Icons
import StartIcon from '@material-ui/icons/SkipNext';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import PublishIcon from '@material-ui/icons/PlayCircleFilledOutlined';
import UnpublishIcon from '@material-ui/icons/Block';
import useVersionAction from '../../../utils/hooks';
import ConfirmationModal from '../../../../../components/ConfirmationModal/ConfirmationModal';

type VersionActionsProps = {
  runtime: Runtime;
  version: Version;
};

type ActionProps = {
  Icon: any;
  label: string;
  action?: Function;
  disabled?: boolean;
};

function VersionActions({ runtime, version }: VersionActionsProps) {
  const [showActionConfirmation, setShowPublishModal] = useState(false);
  const {
    publishVersion,
    startVersion,
    stopVersion,
    unpublishVersion,
    getMutationVars
  } = useVersionAction(runtime.id);

  function onPublishVersion(comment: string) {
    closePublishModal();
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

  function openPublishModal() {
    setShowPublishModal(true);
  }

  function closePublishModal() {
    setShowPublishModal(false);
  }

  const buttons: ActionProps[] = [];

  switch (version.status) {
    case VersionStatus.STOPPED:
      buttons[0] = {
        Icon: StartIcon,
        label: 'START',
        action: onStartVersion
      };
      buttons[1] = {
        Icon: StartIcon,
        label: 'PUBLISH',
        disabled: true
      };
      break;
    case VersionStatus.STARTED:
      buttons[0] = {
        Icon: StopIcon,
        label: 'STOP',
        action: onStopVersion
      };
      buttons[1] = {
        Icon: PublishIcon,
        label: 'PUBLISH',
        action: openPublishModal
      };
      break;
    case VersionStatus.PUBLISHED:
      buttons[0] = {
        Icon: StopIcon,
        label: 'STOP',
        disabled: true
      };
      buttons[1] = {
        Icon: UnpublishIcon,
        label: 'UNPUBLISH',
        action: onUnpublishVersion
      };
      break;
  }

  return (
    <div className={styles.wrapper}>
      {buttons.map((btn, idx) => (
        <div
          key={idx}
          className={cx(styles.item, { [styles.disabled]: btn.disabled })}
          onClick={() => btn.action && btn.action()}
        >
          <div className={styles.icon}>
            <btn.Icon className="icon-small" />
          </div>
          <div>{btn.label}</div>
        </div>
      ))}
      {showActionConfirmation && (
        <ConfirmationModal
          title="YOU ARE ABOUT TO PUBLISH A VERSION"
          message="And this cannot be undone. Are you sure?"
          onAction={onPublishVersion}
          onClose={closePublishModal}
        />
      )}
    </div>
  );
}

export default VersionActions;
