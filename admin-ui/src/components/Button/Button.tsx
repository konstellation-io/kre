import React, { FunctionComponent, MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import SpinnerLinear from '../../components/LoadingComponents/SpinnerLinear/SpinnerLinear';

import cx from 'classnames';
import styles from './Button.module.scss';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

export const BUTTON_THEMES = {
  DEFAULT: 'default',
  DARK: 'dark',
  GREY: 'grey',
  TRANSPARENT: 'transparent'
};
export const BUTTON_ALIGN = {
  LEFT: 'left',
  MIDDLE: 'middle',
  RIGHT: 'right'
};

type Props = {
  label?: string;
  theme?: string;
  border?: boolean;
  Icon?: FunctionComponent<SvgIconProps>;
  to?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  primary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  height?: number;
  align?: string;
  style?: Object;
  className?: string;
};

function Button({
  theme = BUTTON_THEMES.DEFAULT,
  border = false,
  label = 'Button',
  Icon = undefined,
  to = '',
  onClick = function() {},
  primary = false,
  disabled = false,
  loading = false,
  height = 40,
  align = BUTTON_ALIGN.MIDDLE,
  style = {},
  className = ''
}: Props) {
  const content = loading ? (
    <SpinnerLinear size={30} dark />
  ) : (
    <>
      {Icon && <Icon className="icon-small" />}
      <span>{label}</span>
    </>
  );

  const btn = (
    <div
      className={cx(className, styles.btn, styles[theme], styles[align], {
        [styles.primary]: primary,
        [styles.border]: border,
        [styles.label]: !primary,
        [styles.disabled]: disabled
      })}
      style={{ ...style, height, lineHeight: `${height}px` }}
      onClick={onClick}
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
