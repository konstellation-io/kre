import React from 'react';
import styles from './RuntimeHexagon.module.scss';

export enum RuntimeHexagonSize {
  SMALL = 18,
  MEDIUM = 24,
  LARGE = 35
}

type RuntimeHexagonProps = {
  size: RuntimeHexagonSize;
};

function RuntimeHexagon({ size }: RuntimeHexagonProps) {
  return (
    <div className={styles.wrapper} style={{ height: size, width: size }}>
      <div className={styles.hexagon} />
    </div>
  );
}

export default RuntimeHexagon;
