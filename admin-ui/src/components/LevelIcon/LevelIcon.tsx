import React from 'react';
import { LogLevel } from '../../graphql/types/globalTypes';
import IconInfo from '@material-ui/icons/Info';
import styles from './LevelIcon.module.scss';
import cx from 'classnames';

type Props = {
  level: LogLevel;
};
export default function LevelIcon({ level }: Props) {
  let icon = null;

  switch (level) {
    case LogLevel.INFO:
      icon = <IconInfo className="icon-small" />;
      break;
    case LogLevel.DEBUG:
      icon = '!';
      break;
    case LogLevel.WARN:
      icon = '!!';
      break;
    case LogLevel.ERROR:
      icon = '!!!';
      break;
  }

  return <div className={cx(styles.levelIcon, styles[level])}>{icon}</div>;
}
