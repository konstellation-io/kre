import React, { useState } from 'react';

import Lottie from '../../Lottie/Lottie';
import { STATES } from '../../../constants/application';
import animationData from './Hexagon.json';

import styles from './Hexagon.module.scss';
import cx from 'classnames';

const ANIM_SEGMENTS: { [key: string]: number[] } = {
  [STATES.DEFAULT]: [0, 178],
  [STATES.HOVER]: [180, 329],
  [STATES.ACTIVE]: [330, 479],
  [STATES.INACTIVE]: [480, 600]
};

/**
 * Formats default date representation (MM/DD/YYYY) into US representation
 * (month DD, YYYY).
 */
function formatDate(date: string) {
  const options = { day: 'numeric', year: 'numeric', month: 'long' };
  const dateObj = new Date(date);

  return dateObj.toLocaleDateString('en-US', options);
}

type RuntimeInfo = {
  type?: string;
  date: string;
};
type Props = {
  id?: string;
  status?: string;
  title?: string;
  info?: RuntimeInfo[];
  disabled?: boolean;
  size?: number;
  onClick?: any;
};

function Hexagon({
  id = '00000000',
  status = '',
  title = 'Default title',
  info = [],
  disabled = false,
  size = 360,
  onClick = function() {}
}: Props) {
  const defaultAnimation = disabled
    ? ANIM_SEGMENTS.INACTIVE
    : ANIM_SEGMENTS.DEFAULT;
  const [segments, setSegments] = useState(defaultAnimation);
  const [hovered, setHovered] = useState(false);

  const onMouseDown = () => {
    if (!disabled) {
      return setSegments(ANIM_SEGMENTS.ACTIVE);
    }
  };

  const onMouseEnter = () => {
    if (!disabled) {
      setHovered(true);
      return setSegments(ANIM_SEGMENTS.HOVER);
    }
  };

  const onMouseLeave = () => {
    if (!disabled) {
      setHovered(false);
      return setSegments(ANIM_SEGMENTS.DEFAULT);
    }
  };

  // Created and Updated dates. Can show none, one or both.
  const hexInfo = info.map((infoEl, idx) => (
    <div className={styles.info} key={`hexInfo-${idx}`}>
      <span className={styles.info_type}>
        {infoEl.type && infoEl.type.toUpperCase()}
      </span>
      <span>{formatDate(infoEl.date)}</span>
    </div>
  ));

  return (
    <div
      className={cx(styles.container, {
        [styles.active]: segments === ANIM_SEGMENTS.ACTIVE,
        [styles.disabled]: disabled,
        [styles.hovered]: hovered
      })}
    >
      <div className={styles.bg} style={{ height: size, width: size }}>
        <Lottie
          options={{ animationData }}
          width={size}
          height={size}
          segments={segments}
          forceSegments
        />
        <div className={cx(styles.bgOverlap, styles[status])} />
        <div className={styles.bgOverlapText}>{status.toUpperCase()}</div>
      </div>
      <div
        className={styles.hexContent}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <div className={styles.title}>{title}</div>
        <span className={styles.id}>{id}</span>
        {hexInfo}
      </div>
      ;
    </div>
  );
}

export default Hexagon;
