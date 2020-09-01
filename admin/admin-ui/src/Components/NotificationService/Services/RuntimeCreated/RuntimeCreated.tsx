import {
  Notification,
  NotificationType
} from 'Graphql/client/models/Notification';

import ROUTE from 'Constants/routes';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { runtimeCreated } from 'Graphql/subscriptions/types/runtimeCreated';
import { runtimeCreated_watchRuntimeCreated } from 'Graphql/subscriptions/types/runtimeCreated';
import { useApolloClient } from '@apollo/client';
import useNotifications from 'Graphql/hooks/useNotifications';

const RuntimeCreatedSubscription = loader(
  'Graphql/subscriptions/watchRuntimeCreated.graphql'
);

const NOTIFICATION_TIMEOUT = 15 * 1000;

function RuntimeCreated() {
  const { addNotification } = useNotifications();
  const client = useApolloClient();

  client
    .subscribe<runtimeCreated>({
      query: RuntimeCreatedSubscription
    })
    .subscribe({
      next(data) {
        const runtime: runtimeCreated_watchRuntimeCreated = get(
          data,
          'data.watchRuntimeCreated'
        );
        const runtimePath = ROUTE.RUNTIME.replace(':runtimeId', runtime.id);

        const newNotification: Notification = {
          id: `runtime-${runtime.id}-created`,
          message: `The RUNTIME "${runtime.name}" has been successfully created!`,
          type: NotificationType.MESSAGE,
          typeLabel: 'CREATED',
          timeout: NOTIFICATION_TIMEOUT,
          to: runtimePath
        };

        addNotification(newNotification);
      },
      error(err) {
        console.error(
          `Error at onRuntimeCreated subscription: ${err.toString()}`
        );
      }
    });

  return null;
}

export default RuntimeCreated;
