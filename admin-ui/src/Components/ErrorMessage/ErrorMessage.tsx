import React from 'react';
import styles from './ErrorMessage.module.scss';

export default function ErrorMessage() {
  return (
    <div className={styles.container}>
      Something went wrong, refresh the page or try again later.
    </div>
  );
}
