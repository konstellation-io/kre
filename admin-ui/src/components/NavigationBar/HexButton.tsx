import React from 'react';

import styles from './NavigationBar.module.scss';

type Props = {
  label?: string;
};

function HexButton({ label = 'DF' }: Props) {
  const text = label.substring(0, 2).toUpperCase();

  return (
    <div className={styles.buttonWrapper}>
      <div className={styles.buttonContainer} title={label}>
        <div className={styles.button} />
        <div className={styles.buttonText}>{text}</div>
      </div>
    </div>
  );
}

export default HexButton;
