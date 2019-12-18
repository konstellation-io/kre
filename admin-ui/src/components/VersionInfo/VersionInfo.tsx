import React from 'react';
import { useHistory, useParams } from 'react-router';
import * as PAGES from '../../constants/routes';

import Button from '../Button/Button';
import { formatDate } from '../../utils/format';

import EmailIcon from '@material-ui/icons/Email';
import TimeIcon from '@material-ui/icons/AccessTime';
import CalendarIcon from '@material-ui/icons/Today';
import DeployIcon from '@material-ui/icons/SkipNext';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import ActivateIcon from '@material-ui/icons/PlayCircleFilledOutlined';
import DeactivateIcon from '@material-ui/icons/Block';

import { Version } from '../../graphql/models';

import cx from 'classnames';
import styles from './VersionInfo.module.scss';

type ActionButton = {
  label: string;
  Icon: any;
};
const generateButton = (label: string, Icon: any) =>
  ({
    label,
    Icon
  } as ActionButton);

const buttonDeploy = generateButton('DEPLOY', DeployIcon);
const buttonStop = generateButton('STOP', StopIcon);
const buttonActivate = generateButton('ACTIVATE', ActivateIcon);
const buttonDeactivate = generateButton('DEACTIVATE', DeactivateIcon);

const stateToButtons: { [key: string]: ActionButton[] } = {
  STOPPED: [buttonActivate],
  ACTIVE: [buttonDeactivate],
  RUNNING: [buttonActivate, buttonStop],
  CREATED: [buttonDeploy]
};

type Props = {
  version: Version;
};
function VersionInfo({ version }: Props) {
  const history = useHistory();
  const { runtimeId } = useParams();
  const isVersionActive = version.status === 'ACTIVE';

  function onVersionClick() {
    const versionStatusPreviewPath = PAGES.RUNTIME_STATUS_PREVIEW.replace(
      ':runtimeId',
      runtimeId || ''
    ).replace(':versionId', version.id);

    history.push(versionStatusPreviewPath);
  }

  return (
    <div
      className={cx(styles.container)}
      id={`versionInfoElement_${version.description.replace(' ', '')}`}
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
          <div className={styles.actionButtons}>
            {stateToButtons[version.status].map((button: any, idx: number) => (
              <Button key={`ActionButton_${idx}`} {...button} />
            ))}
          </div>
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
  );
}

export default VersionInfo;
