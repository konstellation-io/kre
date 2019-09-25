import React, { useState } from 'react';
import cx from 'classnames';
import { COLORS } from '../../../constants/application';
import styles from './Slider.module.scss';

/**
 * Given an initial color, a final color and a point, returns a CSS gradient that will
 * show initialColor form left to point and finalColor from point to right.
 */
function getGradientFromPoint(
  initialColor: string,
  finalColor: string,
  point: number
) {
  return `linear-gradient(90deg,
    ${initialColor} 0%, ${initialColor} ${point}%,
    ${finalColor} ${point}%, ${finalColor} 100%
  )`;
}

type Props = {
  values?: number[];
  initialValue?: number;
  width?: number;
  onSelect?: (value: number) => void;
};

function Slider({
  values = [0, 100],
  initialValue = 0,
  width = 200,
  onSelect = function(value: number) {},
}: Props = {}) {
  const [value, changeValue] = useState(initialValue);

  function handleChangeValue(newValue: number) {
    changeValue(newValue);
    onSelect(newValue);
  }

  // Track color is different in both sides of the input thumb
  const thumbPoint = (value / (values[1] - values[0])) * 100;
  const gradient = getGradientFromPoint(
    COLORS.BLUE,
    COLORS.GRAY_DISABLED,
    thumbPoint
  );

  return (
    <div className={styles.container} style={{ width }}>
      <span className={styles.initialValue}>{values[0]}</span>
      <div className={styles.sliderContainer}>
        <input
          type="range"
          className={cx(styles.slider)}
          style={{ backgroundImage: gradient }}
          onChange={e => handleChangeValue(parseInt(e.target.value))}
          value={value}
        />
      </div>
      <span className={styles.finalValue}>{values[1]}</span>
    </div>
  );
}

export default Slider;
