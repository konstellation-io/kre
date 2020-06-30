import React from 'react';
import styles from './RuntimeHexagon.module.scss';
import cx from 'classnames';
import { GetVersionConfStatus_runtime } from '../../graphql/queries/types/GetVersionConfStatus';

export enum RuntimeHexagonSize {
  SMALL = 18,
  MEDIUM = 24,
  LARGE = 35
}

type RuntimeHexagonProps = {
  runtime: GetVersionConfStatus_runtime;
  size: RuntimeHexagonSize;
};

function RuntimeHexagon({ runtime, size }: RuntimeHexagonProps) {
  return (
    <div className={styles.wrapper} style={{ height: size, width: size }}>
      <div className={cx(styles.hexagon, styles[runtime.status])}></div>
    </div>
  );
}

export default RuntimeHexagon;
