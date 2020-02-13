import React from 'react';
import Button from '../../../components/Button/Button';
import StartIcon from '@material-ui/icons/SkipNext';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import PublishIcon from '@material-ui/icons/PlayCircleFilledOutlined';
import UnpublishIcon from '@material-ui/icons/Block';
import { VersionStatus } from '../../../graphql/types/globalTypes';

function generateActionButton(label: string, icon: any, action: Function) {
  return (
    <Button
      key={label}
      label={label}
      onClick={action}
      height={30}
      Icon={icon}
    />
  );
}

function getStateToButtons(
  publishAction: Function,
  startAction: Function,
  stopAction: Function,
  unpublishAction: Function
) {
  const buttonStart = generateActionButton('START', StartIcon, startAction);
  const buttonStop = generateActionButton('STOP', StopIcon, stopAction);
  const buttonPublish = generateActionButton(
    'PUBLISH',
    PublishIcon,
    publishAction
  );
  const buttonUnpublish = generateActionButton(
    'UNPUBLISH',
    UnpublishIcon,
    unpublishAction
  );

  return {
    [VersionStatus.STOPPED]: [buttonStart],
    [VersionStatus.PUBLISHED]: [buttonUnpublish],
    [VersionStatus.STARTED]: [buttonPublish, buttonStop],
    [VersionStatus.STOPPED]: [buttonStart]
  };
}

export function getVersionActionButtons(
  publishAction: Function,
  startAction: Function,
  stopAction: Function,
  unpublishAction: Function,
  status?: string
) {
  const stateToButtons: { [key: string]: any } = getStateToButtons(
    publishAction,
    startAction,
    stopAction,
    unpublishAction
  );

  return stateToButtons[status || ''];
}
