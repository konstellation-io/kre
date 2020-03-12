import React, { ReactElement } from 'react';
import RuntimeCreated from './Services/RuntimeCreated/RuntimeCreated';
import Notification from './Notification';

import { useQuery } from '@apollo/react-hooks';
import { GET_LOGIN_STATUS } from '../../graphql/client/queries/getLoginStatus.graphql';
import {
  GET_NOTIFICATIONS,
  GetNotifications,
  GetNotifications_notifications
} from '../../graphql/client/queries/getNotification.graphql';

import styles from './Notification.module.scss';

function NotificationService() {
  const { data } = useQuery(GET_LOGIN_STATUS);
  const { data: notificationsData } = useQuery<GetNotifications>(
    GET_NOTIFICATIONS
  );

  let notificationServices: ReactElement[] = [];

  if (data && data.loggedIn) {
    notificationServices = [
      ...notificationServices,
      <RuntimeCreated key="createRuntimeService" />
    ];
  }

  const notificationComponents =
    notificationsData &&
    notificationsData.notifications.map(
      (notification: GetNotifications_notifications) => (
        <Notification
          {...notification}
          key={notification.id}
          buttonLabel="GO TO RUNTIME"
        />
      )
    );

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.services}>{notificationServices}</div>
      <div className={styles.notifications}>{notificationComponents}</div>
    </div>
  );
}

export default NotificationService;
