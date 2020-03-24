import {
  GET_NOTIFICATIONS,
  GetNotifications_notifications
} from './queries/getNotification.graphql';
import { findIndex } from 'lodash';
import { AddNotificationVariables } from './mutations/addNotification.graphql';
import { RemoveNotificationVariables } from './mutations/removeNotification.graphql';
import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';

export function addNotificationResolver(
  _: any,
  variables: AddNotificationVariables,
  { cache }: ApolloClient<NormalizedCacheObject>
) {
  const data: any = cache.readQuery({
    query: GET_NOTIFICATIONS
  });
  const newNotification = {
    ...variables.input,
    __typename: 'Notification'
  };

  const notificationRepeated = findIndex(data.notifications, newNotification);

  if (notificationRepeated === -1) {
    const notifications = data.notifications.concat([newNotification]);

    cache.writeQuery({
      query: GET_NOTIFICATIONS,
      data: { notifications }
    });
  }

  return null;
}

export function removeNotificationResolver(
  _: any,
  variables: RemoveNotificationVariables,
  { cache }: ApolloClient<NormalizedCacheObject>
) {
  const data: any = cache.readQuery({
    query: GET_NOTIFICATIONS
  });

  const notifications = data.notifications.filter(
    (notification: GetNotifications_notifications) =>
      notification.id !== variables.input.id
  );

  cache.writeQuery({
    query: GET_NOTIFICATIONS,
    data: { notifications }
  });

  return null;
}
