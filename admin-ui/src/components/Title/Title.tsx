import React, { FC } from 'react';
import styles from './Title.module.scss';

type Props = {
  children: string;
};
const Title: FC<Props> = ({ children }) => (
  <div className={styles.header}>
    <div className={styles.title}>{children}</div>
  </div>
);

export default Title;
