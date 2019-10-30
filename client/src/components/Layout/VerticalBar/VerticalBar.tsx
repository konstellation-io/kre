import React, { FunctionComponent } from 'react';
import styles from './VerticalBar.module.scss';

type Props = {};

const VerticalBar: FunctionComponent<Props> = ({ children }) => (
  <div className={styles.container}>{children}</div>
);

export default VerticalBar;
