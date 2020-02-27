import { get } from 'lodash';
import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import Notification from '../../Notification';
import { loader } from 'graphql.macro';
import {
  runtimeCreated_runtimeCreated,
  runtimeCreated
} from '../../../../graphql/subscriptions/types/runtimeCreated';
import { useSubscription, SubscriptionHookOptions } from '@apollo/react-hooks';
import ROUTE from '../../../../constants/routes';

const RuntimeCreatedSubscription = loader(
  '../../../../graphql/subscriptions/runtimeCreated.graphql'
);

const NOTIFICATION_TIMEOUT = 15 * 1000;

type Notification = {
  id: string;
  message: string;
};

function RuntimeCreated() {
  const history = useHistory();
  const location = useLocation();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useSubscription<runtimeCreated>(RuntimeCreatedSubscription, {
    onSubscriptionData: (msg: SubscriptionHookOptions<runtimeCreated>) => {
      const runtime = get(msg, 'subscriptionData.data.runtimeCreated');
      addNotification(runtime);
    }
  });

  function createNotificationObject(
    runtime: runtimeCreated_runtimeCreated
  ): Notification {
    return {
      id: runtime.id,
      message: `The RUNTIME "${runtime.name}" has been successfully created!`
    };
  }

  function addNotification(runtime: runtimeCreated_runtimeCreated) {
    const newNotification = createNotificationObject(runtime);

    // Close notification after NOTIFICATION_TIMEOUT seconds
    setTimeout(() => {
      closeNotification(newNotification.id);
    }, NOTIFICATION_TIMEOUT);

    // Refresh dashboard
    if (location.pathname === ROUTE.HOME) {
      history.push('/other');
      history.replace(ROUTE.HOME);
    }

    setNotifications((notifs: Notification[]) =>
      notifs.concat([newNotification])
    );
  }

  function closeNotification(id: string) {
    setNotifications((notifs: Notification[]) =>
      notifs.filter((notification: Notification) => notification.id !== id)
    );
  }

  const notificationComponents = notifications.map(
    (notification: Notification) => (
      <Notification
        key={notification.id}
        message={notification.message}
        buttonLabel="GO TO RUNTIME"
        buttonAction={() => {
          const runtimePath = ROUTE.RUNTIME.replace(
            ':runtimeId',
            notification.id
          );
          if (!location.pathname.startsWith(runtimePath)) {
            history.push(runtimePath);
          }

          closeNotification(notification.id);
        }}
        onCloseNotification={() => closeNotification(notification.id)}
      />
    )
  );

  return <div>{notificationComponents}</div>;
}

export default RuntimeCreated;
