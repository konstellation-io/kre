import React from 'react';
import styles from './NoApiTokenMessage.module.scss';

function NoApiTokenMessage() {
  return (
    <div className={styles.noToken}>
      <p>
        You have not created an API Token yet. Generate a new one in order to
        start using Konstellation KLI.
      </p>
    </div>
  );
}

export default NoApiTokenMessage;
