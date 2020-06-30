import React, { useState } from 'react';

import Lottie from '../../Lottie/Lottie';
import animationData from './HexagonBorder.json';

import styles from './Hexagon.module.scss';
import cx from 'classnames';
import { Link } from 'react-router-dom';

type Props = {
  to: string;
  size?: number;
  text: string;
};

function HexagonBorder({ to = '', size = 360, text = 'label' }: Props) {
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
      <Link to={to}>
        <div
          className={styles.hexContent}
          data-testid="hexagon-border"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        />
      </Link>
    </div>
  );
}

export default HexagonBorder;
