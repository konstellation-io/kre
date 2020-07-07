import React from 'react';

import styles from './NavigationBar.module.scss';

function AddHexButton() {
  return (
    <div className={styles.addButton}>
      <div className={styles.buttonWrapper}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} />
        </div>
      </div>
      <div className={styles.buttonWrapper}>
        <div className={styles.buttonContainer}>
          <div className={styles.button} />
          <div className={styles.buttonText}>{'+'}</div>
        </div>
      </div>
    </div>
  );
}

export default AddHexButton;
