import React, { FC } from 'react';

import styles from './ModalLayoutInfo.module.scss';

const ModalLayoutInfo: FC = ({ children }) => (
  <div className={styles.message} data-testid="modal-message">
    {children}
  </div>
);

export default ModalLayoutInfo;
