import React from 'react';

import cx from 'classnames';
import styles from './SquaredButton.module.scss';

type Props = {
  onButtonClick: Function;
  id?: string;
  label?: string;
  active?: boolean;
  Icon?: any;
};

function SquaredButton({
  onButtonClick,
  id = 'defaultID',
  label = 'DF',
  Icon = undefined,
  active = false
}: Props) {
  return (
    <div className={styles.container}>
      <div
        className={cx(styles.button, { [styles.active]: active })}
        onClick={() => onButtonClick(id)}
      >
        {Icon ? <Icon className="icon-regular" /> : label}
      </div>
    </div>
  );
}

export default SquaredButton;
