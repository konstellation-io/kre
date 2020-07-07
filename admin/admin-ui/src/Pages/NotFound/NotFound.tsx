import Circle from 'Components/Shape/Circle/Circle';
import React from 'react';
import { STATES } from 'Constants/application';
import styles from './NotFound.module.scss';

function NotFound() {
  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Page not found</h1>
          <Circle animation={STATES.ERROR} label="NOT FOUND" />
        </div>
      </div>
    </div>
  );
}

export default NotFound;
