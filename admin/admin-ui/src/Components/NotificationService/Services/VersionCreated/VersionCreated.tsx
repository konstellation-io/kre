import {
  Notification,
  NotificationType
} from 'Graphql/client/models/Notification';

import { VersionStatus } from 'Graphql/types/globalTypes';
import { WatchVersionStatus_watchVersionStatus } from 'Graphql/subscriptions/types/WatchVersionStatus';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { runtimeCreated } from 'Graphql/subscriptions/types/runtimeCreated';
import { useApolloClient } from '@apollo/client';
import useNotifications from 'Graphql/hooks/useNotifications';

const WatchVersionStatus = loader(
  'Graphql/subscriptions/watchVersionStatus.graphql'
);

const NOTIFICATION_TIMEOUT = 15 * 1000;

function VersionCreated() {
  const { addNotification } = useNotifications();
  const client = useApolloClient();

  client
    .subscribe<runtimeCreated>({
      query: WatchVersionStatus
    })
    .subscribe({
      next(data) {
        const version: WatchVersionStatus_watchVersionStatus = get(
          data,
          'data.watchVersionStatus'
        );

        if (version.status === VersionStatus.CREATED) {
          const newNotification: Notification = {
            id: `version-${version.id}-created`,
            message: `The VERSION "${version.id}" has been successfully created!`,
            type: NotificationType.MESSAGE,
            typeLabel: 'CREATED',
            timeout: NOTIFICATION_TIMEOUT,
            to: ''
          };

          addNotification(newNotification);
        }
      },
      error(err) {
        console.error(
          `Error at watchVersionStatus subscription: ${err.toString()}`
        );
      }
    });

  return null;
}

export default VersionCreated;
