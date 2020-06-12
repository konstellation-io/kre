import { AccessLevel } from '../../types/globalTypes';
import gql from 'graphql-tag';
import { UserSelection } from '../typeDefs';

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
