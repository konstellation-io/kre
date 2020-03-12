import React from 'react';
import onRuntimeCreated from './Services/onRuntimeCreated/onRuntimeCreated';
import Notification from './Notification';

import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { GET_LOGIN_STATUS } from '../../graphql/client/queries/getLoginStatus.graphql';
import {
  GET_NOTIFICATIONS,
  GetNotifications,
  GetNotifications_notifications
} from '../../graphql/client/queries/getNotification.graphql';

import styles from './Notification.module.scss';

function NotificationService() {
  const client = useApolloClient();
  const { data } = useQuery(GET_LOGIN_STATUS);
  const { data: notificationsData } = useQuery<GetNotifications>(
    GET_NOTIFICATIONS
  );

  if (data && data.loggedIn) {
    onRuntimeCreated(client);
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
      {notificationComponents}
    </div>
  );
}

export default NotificationService;
