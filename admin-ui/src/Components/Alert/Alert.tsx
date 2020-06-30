import Button from '../Button/Button';
import ROUTE from 'Constants/routes';
import React from 'react';
import { buildRoute } from 'Utils/routes';
import cx from 'classnames';
import styles from './Alert.module.scss';

export type Props = {
  type: string;
  message: string;
  runtimeId: string;
};

function Alert({ type, message, runtimeId }: Props) {
  return (
    <div className={styles.container}>
      <div className={cx(styles.label, styles[type.toLowerCase()])}>{type}</div>
      <div className={styles.message} title={message}>
        {message}
      </div>
      <Button
        label="GO TO RUNTIME"
        to={buildRoute.runtime(ROUTE.RUNTIME, runtimeId)}
      />
    </div>
  );
}

export default Alert;
