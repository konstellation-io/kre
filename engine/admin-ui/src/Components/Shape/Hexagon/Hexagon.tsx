import React, { useEffect, useState } from 'react';

import ConditionalLink from 'Components/ConditionalLink/ConditionalLink';
import { Lottie } from 'kwc';
import { RuntimeStatus } from 'Graphql/types/globalTypes';
import { STATES } from 'Constants/application';
import { VersionEnvStatus } from 'Pages/Dashboard/Dashboard';
import animationData from './Hexagon.json';
import cx from 'classnames';
import styles from './Hexagon.module.scss';

const ANIM_SEGMENTS: { [key: string]: [number, number] } = {
  [STATES.DEFAULT]: [0, 178],
  [STATES.HOVER]: [180, 329],
  [STATES.STARTED]: [330, 479],
  [STATES.STARTING]: [330, 479],
  [STATES.STOPPING]: [480, 600],
  [STATES.STOPPED]: [480, 600]
};

/**
 * Formats default date representation (MM/DD/YYYY) into US representation
 * (month DD, YYYY).
 */
function formatDate(date: string) {
  const options = { day: 'numeric', year: 'numeric', month: 'long' };
  const dateObj = new Date(date);

  return dateObj.toLocaleDateString('en-US', options as Intl.DateTimeFormatOptions);
}

type RuntimeInfo = {
  type?: string;
  date: string;
};
type Props = {
  id?: string;
  status?: RuntimeStatus | 'UNKNOWN';
  versionStatus?: VersionEnvStatus;
  title?: string;
  info?: RuntimeInfo[];
  disabled?: boolean;
  size?: number;
  to?: string;
};

function Hexagon(
  {
    status = 'UNKNOWN',
    versionStatus = VersionEnvStatus.PUBLISHED,
    title = 'Default title',
    info = [],
    disabled = false,
    size = 360,
    to = ''
  }: Props
) {
  const defaultAnimation = disabled
    ? ANIM_SEGMENTS.STARTED
    : ANIM_SEGMENTS.DEFAULT;
  const [segments, setSegments] = useState<[number, number]>(defaultAnimation);
  const [hovered, setHovered] = useState(false);

  // Update animation when enabling the hexagon
  useEffect(() => {
    if (!disabled) {
      setSegments(ANIM_SEGMENTS.DEFAULT);
    }
  }, [disabled]);

  const onMouseDown = () => {
    if (!disabled) {
      return setSegments(ANIM_SEGMENTS.PUBLISHED);
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
  const hexInfo = info.map(infoEl => (
    <div className={styles.info} key={infoEl.type}>
      <span className={styles.info_type}>
        {infoEl.type && infoEl.type.toUpperCase()}
      </span>
      <span>{formatDate(infoEl.date)}</span>
    </div>
  ));

  return (
    <div
      className={cx(styles.container, {
        [styles.active]: segments === ANIM_SEGMENTS.PUBLISHED,
        [styles.disabled]: disabled,
        [styles.hovered]: hovered
      })}
      data-testid="hexagon"
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
        <div className={cx(styles.bgVersionOverlap, styles[versionStatus])} />
        <div className={styles.bgOverlapText}>{status}</div>
        <div className={styles.bgOverlapVersionText}>
          VERSION: {versionStatus}
        </div>
      </div>
      <ConditionalLink to={to} disabled={to === '' || disabled}>
        <div
          className={styles.hexContent}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className={styles.title} data-testid="hexTitle">
            {title}
          </div>
          {hexInfo}
        </div>
      </ConditionalLink>
    </div>
  );
}

export default Hexagon;
