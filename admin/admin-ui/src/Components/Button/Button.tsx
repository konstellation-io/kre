import React, {
  FunctionComponent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from 'react';

import { Link } from 'react-router-dom';
import SpinnerLinear from 'Components/LoadingComponents/SpinnerLinear/SpinnerLinear';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import cx from 'classnames';
import styles from './Button.module.scss';

export const BUTTON_THEMES = {
  DEFAULT: 'default',
  TRANSPARENT: 'transparent',
  WARN: 'warn'
};
export const BUTTON_ALIGN = {
  LEFT: 'left',
  MIDDLE: 'middle',
  RIGHT: 'right'
};

type Props = {
  label?: string;
  title?: string;
  theme?: string;
  border?: boolean;
  Icon?: FunctionComponent<SvgIconProps>;
  iconSize?: 'icon-regular' | 'icon-small' | 'icon-big';
  to?: string;
  onClick?: Function;
  primary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  height?: number;
  align?: string;
  style?: Object;
  className?: string;
  tabIndex?: number;
  autofocus?: boolean;
  disableTimer?: number;
};

function Button({
  theme = BUTTON_THEMES.DEFAULT,
  border = false,
  label = 'Button',
  title = '',
  Icon = undefined,
  iconSize = 'icon-small',
  to = '',
  onClick = function() {},
  primary = false,
  disabled = false,
  loading = false,
  height = 40,
  align = BUTTON_ALIGN.MIDDLE,
  style = {},
  className = '',
  autofocus = false,
  tabIndex = -1,
  disableTimer = 0
}: Props) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [timerRemainingTime, setTimerRemainingTime] = useState(disableTimer);

  useEffect(() => {
    let timerInterval: number;

    if (disableTimer && timerRemainingTime) {
      timerInterval = window.setInterval(() => {
        setTimerRemainingTime(timerRemainingTime - 1);
        if (timerRemainingTime === 0) clearInterval(timerInterval);
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [disableTimer, timerRemainingTime]);

  useEffect(() => {
    if (autofocus && buttonRef.current && !timerRemainingTime) {
      buttonRef.current.focus();
    }
  }, [autofocus, timerRemainingTime]);

  const timeToEnable = timerRemainingTime && `(${timerRemainingTime}) `;

  const content = loading ? (
    <SpinnerLinear size={30} dark />
  ) : (
    <>
      {Icon && <Icon className={iconSize} />}
      <span>{`${timeToEnable || ''}${label}`}</span>
    </>
  );

  function handleKeyPress(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter') {
      onClick();
    }
  }

  const btn = (
    <div
      className={cx(className, styles.btn, styles[theme], styles[align], {
        [styles.primary]: primary,
        [styles.border]: border,
        [styles.label]: !primary,
        [styles.disabled]: disabled || timerRemainingTime,
        [styles.noLabel]: label === '',
        [styles.notFocussable]: tabIndex === -1
      })}
      style={{ ...style, height, lineHeight: `${height}px` }}
      onClick={() => onClick()}
      onKeyPress={handleKeyPress}
      title={title}
      tabIndex={timerRemainingTime ? -1 : tabIndex}
      ref={buttonRef}
    >
      {content}
    </div>
  );

  let linkButton = to ? (
    <Link to={to} data-testid="buttonLink">
      {btn}
    </Link>
  ) : null;

  return !disabled && to !== '' ? linkButton : btn;
}

export default Button;
