import React from 'react';

import Lottie from '../../Lottie/Lottie';
import { STATES } from '../../../constants/application';
import animationData from './StateCircle.json';

import cx from 'classnames';
import styles from './StateCircle.module.scss';


const ANIM_SEGMENTS: { [key: string]: number[] } = {
  [STATES.INITIALIZING]: [0, 119],
  [STATES.LOADING]: [120, 399],
  [STATES.DISABLED]: [400, 799],
  [STATES.ERROR]: [800, 1199],
  [STATES.ALERT]: [1200, 1599],
  [STATES.SUCCESS]: [1600, 1999],
};

type Props = {
  animation?: string;
  label?: string;
  size?: number;
};

function StateCircle({
  animation = STATES.INITIALIZING,
  label = 'LOADING...',
  size = 250,
}: Props = {}) {
  const animationSegments = [ANIM_SEGMENTS[animation]];

  // Adds loading animation after finishing initiallization animation.
  if (animation === STATES.INITIALIZING) {
    animationSegments.push(ANIM_SEGMENTS.LOADING);
  }

  return (
    <div
      className={styles.loaderContainer}
      style={{ width: size, height: size }}
    >
      <Lottie
        options={{ animationData }}
        width={size}
        height={size}
        segments={animationSegments}
        forceSegments
      />
      <div
        className={cx(styles.innerContainer, {
          [styles.initializing]: animation === STATES.INITIALIZING,
        })}
      >
        {label}
      </div>
    </div>
  );
}

export default StateCircle;
