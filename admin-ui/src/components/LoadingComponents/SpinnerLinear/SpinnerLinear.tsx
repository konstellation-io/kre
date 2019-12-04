import React from 'react';

import Lottie from '../../Lottie/Lottie';
import animationData from './SpinnerLinear.json';

import styles from './SpinnerLinear.module.scss';

type Props = {
  size?: number;
};

function SpinnerLinear({ size = 125 }: Props = {}) {
  return (
    <div
      className={styles.loaderContainer}
      style={{ width: size, height: size }}
      data-testid="spinner"
    >
      <Lottie
        options={{ animationData }}
        width={size}
        height={size}
        segments={[0, 100]}
        forceSegments
      />
    </div>
  );
}

export default SpinnerLinear;
