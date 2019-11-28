import React from 'react';
import { useHistory } from 'react-router';
import Button from '../Button/Button';
import * as PAGES from '../../constants/routes';

import cx from 'classnames';
import styles from './Alert.module.scss';

export type Props = {
  type: string;
  message: string;
  runtimeId: string;
};

function Alert({ type, message, runtimeId }: Props) {
  const history = useHistory();
  return (
    <div className={styles.container}>
      <div className={cx(styles.label, styles[type.toLowerCase()])}>{type}</div>
      <div className={styles.message} title={message}>
        {message}
      </div>
      <Button
        label="GO TO RUNTIME"
        onClick={() =>
          history.push(PAGES.RUNTIME.replace(':runtimeId', runtimeId))
        }
      />
    </div>
  );
}

export default Alert;
