import React from 'react';
import styles from './Spinner.module.scss';

type Props = {
  size?: number;
  color?: string;
};

function Spinner({ size = 40, color = 'white' }: Props) {
  return (
    <div className={styles.contentBox} data-testid="spinner">
      <div className={styles.container} style={{ width: size, height: size }}>
        <div className={styles.sun} style={{ backgroundColor: color }} />
        <div
          className={`${styles.orbit} ${styles.p1}`}
          style={{ borderColor: color }}
        />
        <div className={`${styles.planet_container} ${styles.p1}`}>
          <div
            className={`${styles.planet} ${styles.p1}`}
            style={{ backgroundColor: color }}
          >
            <div
              className={`${styles.planet_container} ${styles.p4}`}
              data-testid="spinner-planet"
            >
              <div
                className={`${styles.planet} ${styles.p4}`}
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        </div>
        <div
          className={`${styles.orbit} ${styles.p2}`}
          style={{ borderColor: color }}
        />
        <div className={`${styles.planet_container} ${styles.p2}`}>
          <div
            className={`${styles.planet} ${styles.p2}`}
            style={{ backgroundColor: color }}
          />
        </div>
        <div className={`${styles.planet_container} ${styles.p3}`}>
          <div
            className={`${styles.planet} ${styles.p3}`}
            style={{ backgroundColor: color }}
          />
        </div>
        <div
          className={`${styles.orbit} ${styles.p5}`}
          style={{ borderColor: color }}
        />
        <div className={`${styles.planet_container} ${styles.p5}`}>
          <div
            className={`${styles.planet} ${styles.p5}`}
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

export default Spinner;
