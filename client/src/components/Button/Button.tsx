import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
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

Button.propTypes = {
  /** Button type, each one has some specific design styles */
  type: PropTypes.oneOf(Object.values(BUTTON_TYPES)),
  label: PropTypes.string,
  /** route to redirect to */
  to: PropTypes.oneOf(Object.values(ROUTES)),
  onClick: PropTypes.func,
  /** Adds an enhancement style to the button */
  primary: PropTypes.bool,
  /** Adds a disabled style to the button */
  disabled: PropTypes.bool,
};

export default Button;
