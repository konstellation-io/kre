import {
  GET_NOTIFICATIONS,
  GetNotifications_notifications
} from './queries/getNotification.graphql';
import { findIndex } from 'lodash';
import { AddNotificationVariables } from './mutations/addNotification.graphql';
import { RemoveNotificationVariables } from './mutations/removeNotification.graphql';
import ApolloClient from 'apollo-client';
import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { UpdateTabFiltersVariables } from './mutations/updateTabFilters.graphql';
import {
  GET_LOG_TABS,
  GetLogTabs,
  GetLogTabs_logTabs
} from './queries/getLogs.graphql';

export function updateTabFiltersResolver(
  _: any,
  variables: UpdateTabFiltersVariables,
  { cache }: ApolloClient<NormalizedCacheObject>
) {
  const { uniqueId, newFilters } = variables.input;
  const data: any = cache.readQuery<GetLogTabs>({
    query: GET_LOG_TABS
  });
  const updatedTabs = data.logTabs.map((logTab: GetLogTabs_logTabs) => {
    if (logTab.uniqueId === uniqueId) {
      return {
        ...logTab,
        filters: { ...logTab.filters, ...newFilters }
      };
    }
    return logTab;
  });
  cache.writeData({
    data: {
      logTabs: updatedTabs
    }
  });
  return null;
}

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
