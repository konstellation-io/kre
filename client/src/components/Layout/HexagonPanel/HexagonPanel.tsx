import React, { FunctionComponent } from 'react';
import styles from './HexagonPanel.module.scss';

type Props = {};

const HexagonPanel: FunctionComponent<Props> = ({ children }) => (
  <div className={styles.container}>{children}</div>
);

export default HexagonPanel;
