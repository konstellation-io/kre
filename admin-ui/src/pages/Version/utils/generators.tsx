import React, { ReactElement, MouseEvent, FunctionComponent } from 'react';
import Button from '../../../components/Button/Button';
import StartIcon from '@material-ui/icons/SkipNext';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import PublishIcon from '@material-ui/icons/PlayCircleFilledOutlined';
import UnpublishIcon from '@material-ui/icons/Block';
import { VersionStatus } from '../../../graphql/types/globalTypes';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

function generateActionButton(
  label: string,
  icon: FunctionComponent<SvgIconProps>,
  action: (e: MouseEvent<HTMLDivElement>) => void
): ReactElement {
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
  publishAction: (e: MouseEvent<HTMLDivElement>) => void,
  startAction: (e: MouseEvent<HTMLDivElement>) => void,
  stopAction: (e: MouseEvent<HTMLDivElement>) => void,
  unpublishAction: (e: MouseEvent<HTMLDivElement>) => void
): { [key: string]: ReactElement[] } {
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
  publishAction: (e: MouseEvent<HTMLDivElement>) => void,
  startAction: (e: MouseEvent<HTMLDivElement>) => void,
  stopAction: (e: MouseEvent<HTMLDivElement>) => void,
  unpublishAction: (e: MouseEvent<HTMLDivElement>) => void,
  status?: string
) {
  const stateToButtons = getStateToButtons(
    publishAction,
    startAction,
    stopAction,
    unpublishAction
  );

  if (status === undefined) {
    return [];
  }

  return stateToButtons[status];
}
