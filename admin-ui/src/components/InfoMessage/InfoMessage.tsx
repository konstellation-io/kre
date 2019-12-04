import React from 'react';
import styles from './InfoMessage.module.scss';

type Props = {
  message: string;
};
export default function InfoMessage({ message }: Props) {
  return <div className={styles.container}>{message}</div>;
}
