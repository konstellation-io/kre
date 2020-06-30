import React from 'react';
import cx from 'classnames';

import styles from './NavigationBar.module.scss';

type Props = {
  label?: string;
  disabled?: boolean;
};

function HexButton({ label = 'DF', disabled = false }: Props) {
  const text = label.substring(0, 2).toUpperCase();

  return (
    <div
      className={cx(styles.buttonWrapper, {
        [styles.disabled]: disabled
      })}
    >
      <div className={styles.buttonContainer} title={label}>
        <div className={styles.button} />
        <div className={styles.buttonText}>{text}</div>
      </div>
    </div>
  );
}

export default HexButton;
