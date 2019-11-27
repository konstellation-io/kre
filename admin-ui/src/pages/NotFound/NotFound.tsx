import React from 'react';

import StateCircle from '../../components/Shape/StateCircle/StateCircle';
import { STATES } from '../../constants/application';

import styles from './NotFound.module.scss';

function NotFound() {
  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Page not found</h1>
          <StateCircle animation={STATES.ERROR} label="NOT FOUND" />;
        </div>
      </div>
    </div>
  );
}

export default NotFound;
