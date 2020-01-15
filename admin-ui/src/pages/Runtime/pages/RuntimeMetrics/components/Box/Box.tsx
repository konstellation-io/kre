import React, { FunctionComponent } from 'react';
import styles from './Box.module.scss';

const Box: FunctionComponent = ({ children }) => (
  <div className={styles.container}>{children}</div>
);

export default Box;
