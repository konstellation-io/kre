import {
  GET_LOGIN_AND_NOTIFICATIONS,
  GetLoginAndNotifications
} from 'Graphql/client/queries/getLoginAndNotifications.graphql';

import { MONORUNTIME_MODE } from 'index';
import Notification from './Notification';
import React from 'react';
import { ReactNode } from 'react';
import RuntimeCreated from './Services/RuntimeCreated/RuntimeCreated';
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

    if (!MONORUNTIME_MODE) {
      services.push(<RuntimeCreated key="runtimeCreated" />);
    }
  }

  const notificationComponents = data?.notifications.map(notification => (
    <Notification
      {...notification}
      key={notification.id}
      buttonLabel="GO TO RUNTIME"
    />
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
