import React from 'react';
import Button from '../Button/Button';

import cx from 'classnames';
import styles from './Alert.module.scss';


type Props = {
  type: string;
  message: string;
  runtimeId: string;
};

function Alert({type, message, runtimeId}: Props) {
  return (
    <div className={styles.container}>
      <div className={cx(styles.label, styles[type])}>
        {type.toUpperCase()}
      </div>
      <div className={styles.message} title={message}>{message}</div>
      <Button
        label='GO TO RUNTIME'
      />
    </div>
  );
}

export default Alert;
