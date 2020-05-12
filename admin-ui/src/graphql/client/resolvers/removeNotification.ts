import {
  GET_NOTIFICATIONS,
  GetNotifications_notifications
} from '../queries/getNotification.graphql';
import { RemoveNotificationVariables } from '../mutations/removeNotification.graphql';
import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';

export default function removeNotification(
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
