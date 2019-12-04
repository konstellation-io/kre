import React from 'react';

import Lottie from '../../Lottie/Lottie';
import animationData from './SpinnerCircular.json';

import styles from './SpinnerCircular.module.scss';

type Props = {
  size?: number;
};

function SpinnerCircular({ size = 125 }: Props = {}) {
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
        segments={[0, 210]}
        forceSegments
      />
    </div>
  );
}

export default SpinnerCircular;
