import { AddNotificationVariables } from '../mutations/addNotification.graphql';
import ApolloClient from 'apollo-client';
import { GET_NOTIFICATIONS } from '../queries/getNotification.graphql';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { findIndex } from 'lodash';

const defaultVariables = {
  typeLabel: ''
};

export default function addNotification(
  _: any,
  variables: AddNotificationVariables,
  { cache }: ApolloClient<NormalizedCacheObject>
) {
  const data: any = cache.readQuery({
    query: GET_NOTIFICATIONS
  });
  const newNotification = {
    ...defaultVariables,
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
