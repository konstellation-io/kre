import React from 'react';
import cx from 'classnames';
import styles from './Box.module.scss';

export enum Sizes {
  REGULAR = 'regular',
  BIG = 'big'
}

type Props = {
  text: string;
  size?: Sizes;
};
function InfoNumber({ text, size = Sizes.REGULAR }: Props) {
  return <p className={cx(styles.infoNumber, styles[size])}>{text}</p>;
}

export default InfoNumber;
