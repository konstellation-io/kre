import React from 'react';
import styles from './Box.module.scss';

type Props = {
  text: string;
};
function Title({ text }: Props) {
  return <p className={styles.title}>{text}</p>;
}

export default Title;
