import React, { FunctionComponent } from 'react';
import styles from './HorizontalBar.module.scss';

type Props = {};

const HorizontalBar: FunctionComponent<Props> = ({ children }) => (
  <div className={styles.container}>{children}</div>
);

export default HorizontalBar;
