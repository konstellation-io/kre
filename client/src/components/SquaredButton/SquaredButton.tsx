import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

import cx from 'classnames';
import styles from './SquaredButton.module.scss';


type Props = {
  onButtonClick: Function;
  id?: string;
  label?: string;
  active?: boolean;
  icon?: IconProp;
};

function SquaredButton({
  onButtonClick,
  id = 'defaultID',
  label = 'DF',
  icon = undefined,
  active = false,
}: Props) {
  return (
    <div className={styles.container}>
      <div
        className={cx(styles.button, { [styles.active]: active })}
        onClick={() => onButtonClick(id)}
      >
        { icon ? <FontAwesomeIcon icon={icon} /> : label }
      </div>
    </div>
  );
}

export default SquaredButton;
