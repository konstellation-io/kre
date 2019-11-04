import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import cx from 'classnames';
import styles from './SquaredButton.module.scss';

type Props = {
  id?: string;
  label?: string;
  active?: boolean;
  onButtonClick?: Function;
  icon?: IconProp;
};

function SquaredButton({
  id = 'defaultID',
  label = 'DF',
  icon = undefined,
  active = false,
  onButtonClick = function() {},
}: Props = {}) {
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
