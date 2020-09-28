import { InMemoryCache, makeVar } from '@apollo/client';
import {
  UserSelection,
  UserSettings
} from 'Graphql/client/models/UserSettings';

import { GetServerLogs_logs_items } from 'Graphql/queries/types/GetServerLogs';
import { LogPanel } from 'Graphql/client/typeDefs';
import { NodeStatus } from 'Graphql/types/globalTypes';
import { Notification } from 'Graphql/client/models/Notification';
import { OpenedVersion } from 'Graphql/client/models/OpenedVersion';

const initialStateOpenedVersion: OpenedVersion = {
  runtimeName: '',
  versionName: '',
  entrypointStatus: NodeStatus.STOPPED
};

const initialStateUserSettings: UserSettings = {
  selectedUserIds: [],
  userSelection: UserSelection.NONE,
  filters: {
    email: null,
    accessLevel: null
  }
};

export const loggedIn = makeVar(false);
export const logs = makeVar<GetServerLogs_logs_items[]>([]);
export const notifications = makeVar<Notification[]>([]);
export const logTabs = makeVar<LogPanel[]>([]);
export const activeTabId = makeVar('');
export const logsOpened = makeVar(false);
export const openedVersion = makeVar<OpenedVersion>(initialStateOpenedVersion);
export const userSettings = makeVar<UserSettings>(initialStateUserSettings);

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        loggedIn: { read: () => loggedIn() },
        logs: { read: () => logs() },
        notifications: { read: () => notifications() },
        logTabs: { read: () => logTabs() },
        activeTabId: { read: () => activeTabId() },
        logsOpened: { read: () => logsOpened() },
        openedVersion: { read: () => openedVersion() },
        userSettings: { read: () => userSettings() },
        runtimes: { merge: false },
        versions: { merge: false },
        settings: { merge: false }
      }
    },
    User: {
      fields: {
        apiTokens: { merge: false }
      }
    },
    Version: {
      fields: { config: { merge: false } }
    }
  }
});

export default cache;
