import { AccessLevel, LogLevel } from 'Graphql/types/globalTypes';

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
  levels?: LogLevel[] | null;
  versionsIds?: string[] | null;
  workflowsNames?: string[] | null;
  __typename: 'logTabFilters';
}

export interface LogPanel {
  runtimeId: string;
  runtimeName: string;
  versionId: string;
  versionName: string;
  uniqueId: string;
  filters: LogPanelFilters;
}

export interface UserSettingsFilters {
  email: string | null;
  accessLevel: AccessLevel | null;
  __typename: 'UserSettingsFilters';
}
