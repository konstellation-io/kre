import {
  REMOVE_NOTIFICATION,
  RemoveNotification,
  RemoveNotificationVariables
} from 'Graphql/client/mutations/removeNotification.graphql';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from 'kwc';
import CloseIcon from '@material-ui/icons/Close';
import { NotificationType } from 'Graphql/client/typeDefs';
import cx from 'classnames';
import styles from './Notification.module.scss';
import { useMutation } from '@apollo/react-hooks';

const MESSAGE_MARGIN = 30;
const MESSAGE_MIN_HEIGHT = 60;

function getMutationVars(id: string) {
  return { variables: { input: { id } } };
}

export type Props = {
  id: string;
  message: string;
  buttonLabel: string;
  typeLabel?: string;
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
  const content = useRef<HTMLInputElement>(null);
  const [opened, setOpened] = useState<boolean>(false);
  const [removeNotification] = useMutation<
    RemoveNotification,
    RemoveNotificationVariables
  >(REMOVE_NOTIFICATION, {
    onError: e => console.error(`removeNotification: ${e}`)
  });

  useEffect(() => {
    let ttl: number;

    setOpened(true);

    if (timeout !== 0) {
      ttl = window.setTimeout(() => {
        removeNotification(getMutationVars(id));
      }, timeout);
    }

    return () => {
      clearTimeout(ttl);
    };
  }, [id, timeout, removeNotification]);

  function onCloseNotification() {
    removeNotification(getMutationVars(id));
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
