import React, { useState } from 'react';

import Lottie from '../../Lottie/Lottie';
import animationData from './HexagonBorder.json';

import styles from './Hexagon.module.scss';
import cx from 'classnames';

type Props = {
  size?: number;
  onClick?: any;
  text: string;
};

function HexagonBorder({
  size = 360,
  onClick = function() {},
  text = 'label'
}: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cx(styles.container, styles.empty, {
        [styles.hovered]: hovered
      })}
    >
      <div className={styles.bg} style={{ height: size, width: size }}>
        <Lottie
          options={{ animationData }}
          width={size}
          height={size}
          segments={[0, 1]}
          forceSegments
        />
        <div className={styles.hexagonBorderText}>{text}</div>
      </div>
      <div
        className={styles.hexContent}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
    </div>
  );
}

export default HexagonBorder;
