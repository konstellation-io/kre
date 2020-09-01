import React, { useEffect, useRef, useState } from 'react';

import { Button } from 'kwc';
import CloseIcon from '@material-ui/icons/Close';
import { NotificationType } from 'Graphql/client/models/Notification';
import cx from 'classnames';
import styles from './Notification.module.scss';
import useNotifications from 'Graphql/hooks/useNotifications';

const MESSAGE_MARGIN = 30;
const MESSAGE_MIN_HEIGHT = 60;

export type Props = {
  id: string;
  message: string;
  buttonLabel: string;
  typeLabel: string | null;
  timeout?: number;
  type?: NotificationType;
  to?: string;
};

function Notification({
  id,
  message,
  buttonLabel,
  typeLabel = '',
  timeout = 0,
  type = NotificationType.MESSAGE,
  to = ''
}: Props) {
  const { removeNotification } = useNotifications();

  const content = useRef<HTMLInputElement>(null);
  const [opened, setOpened] = useState<boolean>(false);

  useEffect(() => {
    let ttl: number;

    setOpened(true);

    if (timeout !== 0) {
      ttl = window.setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }

    return () => {
      clearTimeout(ttl);
    };
  }, [id, timeout, removeNotification]);

  function onCloseNotification() {
    removeNotification(id);
  }

  let style = {
    maxHeight: 0,
    height: 0
  };
  if (content.current !== null && opened) {
    let contentHeight = Math.max(
      MESSAGE_MIN_HEIGHT,
      content.current.getBoundingClientRect().height + MESSAGE_MARGIN
    );
    style.maxHeight = contentHeight;
    style.height = contentHeight;
  }

  const typeText =
    typeLabel || (type === NotificationType.ERROR && NotificationType.ERROR);

  return (
    <div className={cx(styles.container, styles[type])} style={style}>
      {typeText && <div className={styles.typeLabel}>{typeText}</div>}
      <div className={styles.message} title={message} ref={content}>
        {message}
      </div>
      {to && <Button label={buttonLabel} to={to} />}
      <Button label={''} Icon={CloseIcon} onClick={onCloseNotification} />
    </div>
  );
}

export default Notification;
