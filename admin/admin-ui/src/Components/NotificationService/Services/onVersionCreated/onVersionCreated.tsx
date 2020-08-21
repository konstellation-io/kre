import {
  ADD_NOTIFICATION,
  AddNotification,
  AddNotificationVariables
} from 'Graphql/client/mutations/addNotification.graphql';
import {get} from 'lodash';

import ApolloClient from 'apollo-client';
import {NotificationType} from 'Graphql/client/typeDefs';
import {loader} from 'graphql.macro';
import {
  WatchVersionStatus as watchVersionStatus,
  WatchVersionStatus_watchVersionStatus
} from 'Graphql/subscriptions/types/WatchVersionStatus';
import {VersionStatus} from "../../../../Graphql/types/globalTypes";

const WatchVersionStatus = loader(
  'Graphql/subscriptions/watchVersionStatus.graphql'
);

const NOTIFICATION_TIMEOUT = 15 * 1000;

function onVersionCreated(client: ApolloClient<object>) {
  client
    .subscribe<watchVersionStatus>({
      query: WatchVersionStatus
    })
    .subscribe({
      next(data) {
        const version: WatchVersionStatus_watchVersionStatus = get(
          data,
          'data.watchVersionStatus'
        );

        if (version.status === VersionStatus.CREATED){
          client.mutate<AddNotification, AddNotificationVariables>({
            mutation: ADD_NOTIFICATION,
            variables: {
              input: {
                id: `version-${version.id}-created`,
                message: `The VERSION "${version.id}" has been successfully created!`,
                type: NotificationType.MESSAGE,
                typeLabel: 'CREATED',
                timeout: NOTIFICATION_TIMEOUT,
                to: ""
              }
            }
          });
        }
      },
      error(err) {
        console.error(
          `Error at onVersionCreated subscription: ${err.toString()}`
        );
      }
    });
}

export default onVersionCreated;
