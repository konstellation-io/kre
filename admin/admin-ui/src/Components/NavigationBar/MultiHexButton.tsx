import React from 'react';

import styles from './NavigationBar.module.scss';

function MultiHexButton() {
  return (
    <div className={styles.buttonWrapper}>
      <div className={styles.miniHex}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} />
        </div>
      </div>
      <div className={styles.miniHex}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} />
        </div>
      </div>
      <div className={styles.miniHex}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} />
        </div>
      </div>
      <div className={styles.miniHex}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} />
        </div>
      </div>
    </div>
  );
}

export default MultiHexButton;
