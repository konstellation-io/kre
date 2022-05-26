import React, { FunctionComponent, ReactElement } from 'react';
import styles from './HexagonPanel.module.scss';

type Props = {
  children: ReactElement | ReactElement[];
  dataTestId?: string;
};

const HexagonPanel: FunctionComponent<Props> = ({ children, dataTestId = '' }) => (
  <div className={styles.container} data-testid={dataTestId}>{children}</div>
);

export default HexagonPanel;
