import { AccessLevel } from 'Graphql/types/globalTypes';
import { UserSelection } from 'Graphql/client/models/UserSettings';
import { gql } from '@apollo/client';

export interface GetUserSettings_filters {
  email: string | null;
  accessLevel: AccessLevel | null;
}

export interface GetUserSettings {
  userSettings: {
    selectedUserIds: string[];
    userSelection: UserSelection;
    filters: GetUserSettings_filters;
  };
}

export const GET_USER_SETTINGS = gql`
  {
    userSettings @client {
      selectedUserIds
      userSelection
      filters {
        email
        accessLevel
      }
    }
  }
`;
