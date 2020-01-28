import React from 'react';
import styles from '../Settings.module.scss';

type Props = {
  title: string;
  subtitle?: string;
};
function SettingsHeader({ title, subtitle }: Props) {
  return (
    <>
      <div className={styles.formTitle}>{title}</div>
      {subtitle && <div className={styles.formDescription}>{subtitle}</div>}
    </>
  );
}

export default SettingsHeader;
