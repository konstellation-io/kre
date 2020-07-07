import React, { memo } from 'react';

import IconAdd from '@material-ui/icons/Add';
import IconBlock from '@material-ui/icons/Block';
import IconPublish from '@material-ui/icons/Publish';
import IconRemove from '@material-ui/icons/Delete';
import IconSettings from '@material-ui/icons/Settings';
import IconStart from '@material-ui/icons/PlayCircleOutline';
import IconStop from '@material-ui/icons/Stop';
import IconUnknown from '@material-ui/icons/Help';
import IconUnpublish from '@material-ui/icons/GetApp';
import IconUser from '@material-ui/icons/AccountBox';
import { SvgIconProps } from '@material-ui/core/SvgIcon/SvgIcon';
import { UserActivityType } from 'Graphql/types/globalTypes';
import cx from 'classnames';
import styles from './ActivityIcon.module.scss';

enum IconColors {
  DARK = 'font-dark',
  LIGHT = 'font-light'
}

enum IconBackgrounds {
  HIGHTLIGHT = 'hightlight',
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  LIGHT = 'light',
  LOWLIGHT = 'lowlight',
  REGULAR = 'regular'
}

type IconProps = {
  Icon: (props: SvgIconProps) => JSX.Element;
  color: IconColors;
  background: IconBackgrounds;
};

const defaultIconProps = {
  Icon: IconUnknown,
  color: IconColors.DARK,
  background: IconBackgrounds.ERROR
};

function buildIconProp(
  Icon: (props: SvgIconProps) => JSX.Element,
  color: IconColors,
  background: IconBackgrounds
): IconProps {
  return {
    Icon,
    color,
    background
  };
}

export const activityToIconProps = new Map([
  [
    UserActivityType.CREATE_RUNTIME,
    buildIconProp(IconAdd, IconColors.DARK, IconBackgrounds.LOWLIGHT)
  ],
  [
    UserActivityType.CREATE_USER,
    buildIconProp(IconAdd, IconColors.DARK, IconBackgrounds.LOWLIGHT)
  ],
  [
    UserActivityType.CREATE_VERSION,
    buildIconProp(IconAdd, IconColors.DARK, IconBackgrounds.LOWLIGHT)
  ],
  [
    UserActivityType.LOGIN,
    buildIconProp(IconUser, IconColors.DARK, IconBackgrounds.HIGHTLIGHT)
  ],
  [
    UserActivityType.LOGOUT,
    buildIconProp(IconUser, IconColors.LIGHT, IconBackgrounds.REGULAR)
  ],
  [
    UserActivityType.PUBLISH_VERSION,
    buildIconProp(IconPublish, IconColors.DARK, IconBackgrounds.HIGHTLIGHT)
  ],
  [
    UserActivityType.REMOVE_USERS,
    buildIconProp(IconRemove, IconColors.DARK, IconBackgrounds.LIGHT)
  ],
  [
    UserActivityType.REVOKE_SESSIONS,
    buildIconProp(IconBlock, IconColors.DARK, IconBackgrounds.LIGHT)
  ],
  [
    UserActivityType.START_VERSION,
    buildIconProp(IconStart, IconColors.DARK, IconBackgrounds.SUCCESS)
  ],
  [
    UserActivityType.STOP_VERSION,
    buildIconProp(IconStop, IconColors.DARK, IconBackgrounds.LOWLIGHT)
  ],
  [
    UserActivityType.UNPUBLISH_VERSION,
    buildIconProp(IconUnpublish, IconColors.DARK, IconBackgrounds.INFO)
  ],
  [
    UserActivityType.UPDATE_ACCESS_LEVELS,
    buildIconProp(IconUser, IconColors.LIGHT, IconBackgrounds.REGULAR)
  ],
  [
    UserActivityType.UPDATE_SETTING,
    buildIconProp(IconSettings, IconColors.DARK, IconBackgrounds.LIGHT)
  ],
  [
    UserActivityType.UPDATE_VERSION_CONFIGURATION,
    buildIconProp(IconSettings, IconColors.DARK, IconBackgrounds.LIGHT)
  ]
]);

type Props = {
  activityType: UserActivityType;
  size?: number;
  invert?: boolean;
};
function ActivityIcon({ activityType, invert, size = 24 }: Props) {
  const iconProps = activityToIconProps.get(activityType) || defaultIconProps;

  return (
    <div
      className={cx(styles.container, {
        [styles[iconProps.background]]: !invert
      })}
      style={{ width: size, height: size }}
    >
      <div
        className={cx(
          styles.icon,
          styles[invert ? iconProps.background : iconProps.color]
        )}
      >
        <iconProps.Icon className="icon-regular" />
      </div>
    </div>
  );
}

export default memo(ActivityIcon);
