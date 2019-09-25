import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import styles from './Button.module.scss';

export const BUTTON_TYPES = {
  DEFAULT: 'default',
  DARK: 'dark',
};

function Button({
  type = BUTTON_TYPES.DEFAULT,
  label = 'Button',
  to = '',
  onClick = function() {},
  primary = false,
  disabled = false,
} = {}) {
  const btn = (
    <div
      className={cx(styles.btn, {
        [styles.dark]: type === BUTTON_TYPES.DARK,
        [styles.primary]: primary,
        [styles.label]: !primary,
        [styles.disabled]: disabled,
      })}
      onClick={onClick}
    >
      {label}
    </div>
  );

  return !disabled && to !== '' ? <Link to={to}>{btn}</Link> : btn;
}

export default Button;
