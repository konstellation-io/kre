import React, { FC } from 'react';
import styles from '../../Settings.module.scss';

type Props = {
  children: string;
};
const SettingsHeader: FC<Props> = ({ children }) => {
  return (
    <div className={styles.header}>
      <div className={styles.formTitle}>{children}</div>
    </div>
  );
};

export default SettingsHeader;
