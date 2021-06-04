import Notification from './Notification';
import React, { ReactNode } from 'react';
import VersionCreated from './Services/VersionCreated/VersionCreated';
import styles from './Notification.module.scss';
import { useReactiveVar } from '@apollo/client';
import { loggedIn, notifications } from '../../Graphql/client/cache';

function NotificationService() {
  const dataLoggedIn = useReactiveVar(loggedIn);
  const dataNotifications = useReactiveVar(notifications);

  let services: ReactNode[] = [];

  if (dataLoggedIn) {
    services = [<VersionCreated key="versionCreated" />];
  }

  const notificationComponents = dataNotifications.map(notification => (
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
