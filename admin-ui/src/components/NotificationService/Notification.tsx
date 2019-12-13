import React, { useState, useEffect } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import Button from '../Button/Button';

import cx from 'classnames';
import styles from './Notification.module.scss';

export type Props = {
  message: string;
  buttonLabel: string;
  buttonAction: Function;
  onCloseNotification: Function;
};

function Notification({
  message,
  buttonLabel,
  buttonAction,
  onCloseNotification
}: Props) {
  const [opened, setOpened] = useState<boolean>(false);

  useEffect(() => {
    setOpened(true);
  }, []);

  return (
    <div
      className={cx(styles.container, {
        [styles.opened]: opened
      })}
    >
      <div className={styles.message} title={message}>
        {message}
      </div>
      <Button label={buttonLabel} onClick={buttonAction} />
      <Button label={''} Icon={CloseIcon} onClick={onCloseNotification} />
    </div>
  );
}

export default Notification;
