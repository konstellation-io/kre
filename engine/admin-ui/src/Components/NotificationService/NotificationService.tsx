import {
  GET_LOGIN_AND_NOTIFICATIONS,
  GetLoginAndNotifications
} from 'Graphql/client/queries/getLoginAndNotifications.graphql';

import Notification from './Notification';
import React from 'react';
import { ReactNode } from 'react';
import VersionCreated from './Services/VersionCreated/VersionCreated';
import styles from './Notification.module.scss';
import { useQuery } from '@apollo/client';

function NotificationService() {
  const { data } = useQuery<GetLoginAndNotifications>(
    GET_LOGIN_AND_NOTIFICATIONS
  );

  let services: ReactNode[] = [];

  if (data?.loggedIn) {
    services = [<VersionCreated key="versionCreated" />];
  }

  const notificationComponents = data?.notifications.map(notification => (
    <Notification {...notification} key={notification.id} />
  ));

  return (
    <>
      <div className={styles.notificationsContainer}>
        {notificationComponents}
      </div>
      <div>{services}</div>
    </>
  );
}

export default NotificationService;
