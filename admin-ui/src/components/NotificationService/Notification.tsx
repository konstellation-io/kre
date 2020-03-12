import React, { useState, useEffect, useRef } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import { useMutation } from '@apollo/react-hooks';
import {
  REMOVE_NOTIFICATION,
  RemoveNotification,
  RemoveNotificationVariables
} from '../../graphql/client/mutations/removeNotification.graphql';
import Button from '../Button/Button';

import cx from 'classnames';
import styles from './Notification.module.scss';
import { NotificationType } from '../../graphql/client/typeDefs';

const MESSAGE_MARGIN = 30;
const MESSAGE_MIN_HEIGHT = 60;

function getMutationVars(id: string) {
  return { variables: { input: { id } } };
}

export type Props = {
  id: string;
  message: string;
  buttonLabel: string;
  timeout?: number;
  type?: NotificationType;
  to?: string;
};

function Notification({
  id,
  message,
  buttonLabel,
  timeout = 0,
  type = NotificationType.MESSAGE,
  to = ''
}: Props) {
  const content = useRef<HTMLInputElement>(null);
  const [opened, setOpened] = useState<boolean>(false);
  const [removeNotification] = useMutation<
    RemoveNotification,
    RemoveNotificationVariables
  >(REMOVE_NOTIFICATION);

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

  return (
    <div className={cx(styles.container, styles[type])} style={style}>
      <div className={styles.message} title={message} ref={content}>
        {message}
      </div>
      {to && <Button label={buttonLabel} to={to} />}
      <Button label={''} Icon={CloseIcon} onClick={onCloseNotification} />
    </div>
  );
}

export default Notification;
