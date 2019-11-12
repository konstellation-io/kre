import React from 'react';
import Button from '../Button/Button';
import * as PAGES from '../../constants/routes'; 

import cx from 'classnames';
import styles from './Alert.module.scss';
import { History } from 'history';


type Props = {
  type: string;
  message: string;
  runtimeId: string;
  history: History;
};

function Alert({type, message, runtimeId, history}: Props) {
  return (
    <div className={styles.container}>
      <div className={cx(styles.label, styles[type])}>
        {type.toUpperCase()}
      </div>
      <div className={styles.message} title={message}>{message}</div>
      <Button
        label='GO TO RUNTIME'
        onClick={() => history.push(
          PAGES.RUNTIME.replace(':runtimeId', runtimeId),
          { prevLocation: PAGES.DASHBOARD }
        )}
      />
    </div>
  );
}

export default Alert;
