import { AccessLevel } from './../../types/globalTypes';

export interface UserSettings {
  selectedUserIds: string[];
  userSelection: UserSelection;
  filters: UserSettingsFilters;
}

export interface UserSettingsFilters {
  email: string | null;
  accessLevel: AccessLevel | null;
}

export enum UserSelection {
  ALL,
  INDETERMINATE,
  NONE
}
