import { Notification } from 'Graphql/client/models/Notification';
import { findIndex } from 'lodash';
import { notifications } from 'Graphql/client/cache';

function useNotifications() {
  const repeated = (target: Notification) =>
    findIndex(notifications(), target) !== -1;

  function addNotification(newNotification: Notification) {
    if (!repeated(newNotification)) {
      notifications([...notifications(), newNotification]);
    }
  }

  function removeNotification(targetId: string) {
    notifications(notifications().filter(act => act.id !== targetId));
  }

  return {
    addNotification,
    removeNotification
  };
}

export default useNotifications;
