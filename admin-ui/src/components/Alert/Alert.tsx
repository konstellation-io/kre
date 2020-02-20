import React from 'react';
import { useHistory } from 'react-router';
import Button from '../Button/Button';
import ROUTE from '../../constants/routes';

import cx from 'classnames';
import styles from './Alert.module.scss';
import { buildRoute } from '../../utils/routes';

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
          history.push(buildRoute.runtime(ROUTE.RUNTIME, runtimeId))
        }
      />
    </div>
  );
}

export default Alert;
