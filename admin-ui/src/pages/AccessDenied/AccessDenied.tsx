import React from 'react';

import Circle from '../../components/Shape/Circle/Circle';
import { STATES } from '../../constants/application';

import styles from './AccessDenied.module.scss';

function AccessDenied() {
  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Higher access level required</h1>
          <Circle animation={STATES.ERROR} label="ACCESS DENIED" />
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
