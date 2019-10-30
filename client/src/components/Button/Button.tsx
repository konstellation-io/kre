import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import Spinner from '../../components/Spinner/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import styles from './Button.module.scss';

export const BUTTON_TYPES = {
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
  type?: string;
  border?: boolean;
  label?: string;
  icon?: IconProp;
  to?: string;
  onClick?: any;
  primary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  height?: number;
  align?: string;
  style?: Object;
};

function Button({
  type = BUTTON_TYPES.DEFAULT,
  border = false,
  label = 'Button',
  icon = undefined,
  to = '',
  onClick = function() {},
  primary = false,
  disabled = false,
  loading = false,
  height = 40,
  align = BUTTON_ALIGN.MIDDLE,
  style = {}
}:Props = {}) {
  const content = loading
    ? <Spinner size={ 30 } color='#0d0e11' />
    : <>
      { icon && <FontAwesomeIcon icon={icon} />}
      <span>{label}</span>
    </>;

  const btn = (
    <div
      className={cx(styles.btn, styles[type], styles[align], {
        [styles.primary]: primary,
        [styles.border]: border,
        [styles.label]: !primary,
        [styles.disabled]: disabled,
      })}
      style={{ ...style, height, lineHeight: `${height}px` }}
      onClick={onClick}
    >
      {content}
    </div>
  );

  return !disabled && to !== '' ? <Link to={to} data-testid='buttonLink'>{btn}</Link> : btn;
}

Button.propTypes = {
  /** Button type, each one has some specific design styles */
  type: PropTypes.oneOf(Object.values(BUTTON_TYPES)),
  /** If true, the button shows a border */
  border: PropTypes.bool,
  label: PropTypes.string,
  /** route to redirect to */
  to: PropTypes.oneOf(Object.values(ROUTES)),
  onClick: PropTypes.func,
  /** Adds an enhancement style to the button */
  primary: PropTypes.bool,
  /** Adds a disabled style to the button */
  disabled: PropTypes.bool,
  height: PropTypes.number,
};

export default Button;
