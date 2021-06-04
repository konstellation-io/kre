import {
  Notification,
  NotificationType
} from 'Graphql/client/models/Notification';

import { VersionStatus } from 'Graphql/types/globalTypes';
import { WatchVersion_watchVersion } from 'Graphql/subscriptions/types/WatchVersion';
import { get } from 'lodash';
import { useApolloClient } from '@apollo/client';
import useNotifications from 'Graphql/hooks/useNotifications';

import WatchVersion from 'Graphql/subscriptions/watchVersion';

const NOTIFICATION_TIMEOUT = 15 * 1000;

function VersionCreated() {
  const { addNotification } = useNotifications();
  const client = useApolloClient();

  client
    .subscribe({
      query: WatchVersion
    })
    .subscribe({
      next(data) {
        const version: WatchVersion_watchVersion = get(
          data,
          'data.watchVersion'
        );

        if (version.status === VersionStatus.CREATED) {
          const newNotification: Notification = {
            id: `version-${version.id}-created`,
            message: `The VERSION "${version.name}" has been successfully created!`,
            type: NotificationType.MESSAGE,
            typeLabel: 'CREATED',
            timeout: NOTIFICATION_TIMEOUT,
            to: ''
          };

          addNotification(newNotification);
        }
      },
      error(err) {
        console.error(`Error at watchVersion subscription: ${err.toString()}`);
      }
    });

  return null;
}

export default VersionCreated;
