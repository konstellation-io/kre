import React from 'react';
import { Version } from '../../../../../graphql/models';
import cx from 'classnames';
import styles from './VersionActions.module.scss';

// Icons
import StartIcon from '@material-ui/icons/SkipNext';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import PublishIcon from '@material-ui/icons/PlayCircleFilledOutlined';
import UnpublishIcon from '@material-ui/icons/Block';

type VersionActionsProps = {
  version: Version;
};

function VersionActions({ version }: VersionActionsProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.item}>
        <div className={styles.icon}>
          <StartIcon className="icon-small" />
        </div>
        <div>START</div>
      </div>
      <div className={cx(styles.item, { [styles.disabled]: true })}>
        <div className={styles.icon}>
          <PublishIcon className="icon-small" />
        </div>
        <div>PUBLISH</div>
      </div>
    </div>
  );
}

export default VersionActions;
