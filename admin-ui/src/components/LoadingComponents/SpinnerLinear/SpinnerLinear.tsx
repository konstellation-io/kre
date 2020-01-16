import React from 'react';

import Lottie from '../../Lottie/Lottie';
import animationData from './SpinnerLinear.json';

import cx from 'classnames';
import styles from './SpinnerLinear.module.scss';

type Props = {
  size?: number;
  dark?: boolean;
};

function SpinnerLinear({ size = 125, dark = false }: Props = {}) {
  return (
    <div
      className={cx(styles.loaderContainer, {
        [styles.dark]: dark
      })}
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
