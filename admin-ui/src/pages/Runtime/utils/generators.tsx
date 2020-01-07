import React from 'react';
import Button, { BUTTON_TYPES } from '../../../components/Button/Button';
import DeployIcon from '@material-ui/icons/SkipNext';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import ActivateIcon from '@material-ui/icons/PlayCircleFilledOutlined';
import DeactivateIcon from '@material-ui/icons/Block';
import { VersionStatus } from '../../../graphql/models';

const disabledButtons = ['STOP', 'DEACTIVATE'];

function generateActionButton(label: string, icon: any, action: Function) {
  return (
    <Button
      key={label}
      label={label}
      disabled={disabledButtons.includes(label)}
      onClick={action}
      height={30}
      Icon={icon}
    />
  );
}

function getStateToButtons(
  activateAction: Function,
  deployAction: Function,
  stopAction: Function,
  deactivateAction: Function
) {
  const buttonDeploy = generateActionButton('DEPLOY', DeployIcon, deployAction);
  const buttonStop = generateActionButton('STOP', StopIcon, stopAction);
  const buttonActivate = generateActionButton(
    'ACTIVATE',
    ActivateIcon,
    activateAction
  );
  const buttonDeactivate = generateActionButton(
    'DEACTIVATE',
    DeactivateIcon,
    deactivateAction
  );

  return {
    [VersionStatus.STOPPED]: [buttonDeploy],
    [VersionStatus.ACTIVE]: [buttonDeactivate],
    [VersionStatus.RUNNING]: [buttonActivate, buttonStop],
    [VersionStatus.CREATED]: [buttonDeploy]
  };
}

export function getVersionActionButtons(
  activateAction: Function,
  deployAction: Function,
  stopAction: Function,
  deactivateAction: Function,
  status?: string
) {
  const stateToButtons: { [key: string]: any } = getStateToButtons(
    activateAction,
    deployAction,
    stopAction,
    deactivateAction
  );

  return stateToButtons[status || ''];
}
