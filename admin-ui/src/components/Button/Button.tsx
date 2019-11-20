import React from 'react';
import { Link, useParams } from 'react-router-dom';

import Spinner from '../../components/Spinner/Spinner';

import cx from 'classnames';
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
  label?: string;
  type?: string;
  border?: boolean;
  Icon?: any;
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
  Icon = undefined,
  to = '',
  onClick = function() {},
  primary = false,
  disabled = false,
  loading = false,
  height = 40,
  align = BUTTON_ALIGN.MIDDLE,
  style = {}
}: Props) {
  const params = useParams();

  const content = loading ? (
    <Spinner size={30} color="#0d0e11" />
  ) : (
    <>
      {Icon && <Icon style={{ fontSize: '1rem' }} />}
      <span>{label}</span>
    </>
  );

  const btn = (
    <div
      className={cx(styles.btn, styles[type], styles[align], {
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

  let linkButton = null;
  if (to) {
    let redirectionRoute = to;
    Object.entries(params).map(([param, value]) => {
      // @ts-ignore
      redirectionRoute = redirectionRoute.replace(`:${param}`, value);
    });

    linkButton = (
      <Link to={redirectionRoute} data-testid="buttonLink">
        {btn}
      </Link>
    );
  }

  return !disabled && to !== '' ? linkButton : btn;
}

export default Button;
