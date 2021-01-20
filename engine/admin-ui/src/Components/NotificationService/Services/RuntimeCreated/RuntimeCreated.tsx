import {
  Notification,
  NotificationType
} from 'Graphql/client/models/Notification';

import ROUTE from 'Constants/routes';
import { RuntimeStatus } from 'Graphql/types/globalTypes';
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

function newInfoNotification(
  runtime: runtimeCreated_watchRuntimeCreated
): Notification {
  const runtimePath = ROUTE.RUNTIME.replace(':runtimeId', runtime.id);

  return {
    id: `runtime-${runtime.id}-created`,
    message: `The RUNTIME "${runtime.name}" has been successfully created!`,
    type: NotificationType.MESSAGE,
    typeLabel: 'CREATED',
    timeout: NOTIFICATION_TIMEOUT,
    to: runtimePath
  };
}

function newErrorNotification(
  runtime: runtimeCreated_watchRuntimeCreated
): Notification {
  return {
    id: `runtime-${runtime.id}-creation-error`,
    message: `The RUNTIME "${runtime.name}" could not be created!`,
    type: NotificationType.ERROR,
    typeLabel: 'ERROR',
    timeout: 0,
    to: ''
  };
}

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

        const newNotification =
          runtime.status === RuntimeStatus.STARTED
            ? newInfoNotification(runtime)
            : newErrorNotification(runtime);

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
