import { AccessLevel } from './../../../../graphql/types/globalTypes';
export type ModalInfo = {
  action: () => void;
  title: string;
  userIds: string[];
  message: string;
  acceptLabel: string;
  confirmMessage: string;
};

export const defaultModalInfo = {
  action: () => {},
  title: '',
  userIds: [],
  message: '',
  acceptLabel: '',
  confirmMessage: ''
};

type setModalInfoParams = {
  type: 'delete' | 'revoke' | 'update';
  action: () => void;
  nUsers: number;
  userIds: string[];
  plural: boolean;
  accessLevel?: AccessLevel;
};
export function getModalInfo({
  type,
  action,
  nUsers,
  userIds,
  plural,
  accessLevel
}: setModalInfoParams): ModalInfo {
  switch (type) {
    case 'delete':
      return {
        action,
        userIds,
        title: 'User deletion',
        message: `The following user${plural ? 's' : ''} will be deleted:`,
        acceptLabel: `REMOVE ${nUsers} USER${plural ? 'S' : ''}`,
        confirmMessage: 'Are you sure you want to perform this action?'
      };
    case 'revoke':
      return {
        action,
        userIds,
        title: 'User revoke',
        message: `The following user${plural ? 's' : ''} will be revoked:`,
        acceptLabel: `REVOKE SESSIONS OF ${nUsers} USER${plural ? 'S' : ''}`,
        confirmMessage: 'Are you sure you want to perform this action?'
      };
    case 'update':
      return {
        action,
        userIds,
        title: 'User access level update',
        message: `The following user${plural ? 's' : ''} will be updated:`,
        acceptLabel: `UPDATE ${nUsers} USER${plural ? 'S' : ''}`,
        confirmMessage: `Access level will be changed to ${accessLevel}. Are you sure you want to perform this action?`
      };
    default:
      return defaultModalInfo;
  }
}
