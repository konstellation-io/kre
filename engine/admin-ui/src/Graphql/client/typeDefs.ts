import { AccessLevel } from 'Graphql/types/globalTypes';
import { NotificationType } from 'Graphql/client/models/Notification';

export interface AddNotificationInput {
  id: string;
  message: string;
  type: NotificationType;
  timeout: number;
  to: string;
  typeLabel?: string;
}

export interface AddLogTabInput {
  runtimeId: string;
  runtimeName: string;
  versionId: string;
  versionName: string;
  nodes: NodeSelection[];
}

export interface NodeSelection {
  workflowName: string;
  nodeNames: string[];
  __typename: string;
}

export interface LogPanelFilters {
  dateOption?: string;
  startDate?: string;
  endDate?: string;
  nodes?: NodeSelection[];
  search?: string;
  levels?: string[] | null;
  __typename: 'logTabFilters';
}

export interface LogPanel {
  runtimeId: string;
  runtimeName: string;
  versionId: string;
  versionName: string;
  uniqueId?: string;
  filters?: LogPanelFilters;
}

export interface UserSettingsFilters {
  email: string | null;
  accessLevel: AccessLevel | null;
  __typename: 'UserSettingsFilters';
}

export interface RemoveNotificationInput {
  id: string;
}
