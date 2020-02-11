import React from 'react';
import RuntimeCreated from './Services/RuntimeCreated/RuntimeCreated';

import { useQuery } from '@apollo/react-hooks';
import { GET_LOGIN_STATUS } from './NotificationService.graphql';

import styles from './Notification.module.scss';

function NotificationService() {
  const { data } = useQuery(GET_LOGIN_STATUS);

  let notificationServices: any = [];

  if (data && data.loggedIn) {
    notificationServices = [<RuntimeCreated key="createRuntimeService" />];
  }

  return (
    <div className={styles.notificationsContainer}>{notificationServices}</div>
  );
}

export default NotificationService;
