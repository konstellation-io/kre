import React, { FunctionComponent, ReactElement } from 'react';
import styles from './HexagonPanel.module.scss';

type Props = {
  children: ReactElement | ReactElement[];
};

const HexagonPanel: FunctionComponent<Props> = ({ children }) => (
  <div className={styles.container}>{children}</div>
);

export default HexagonPanel;
