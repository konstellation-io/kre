import { AccessLevel } from 'Graphql/types/globalTypes';
export type ModalInfo = {
  action: (comment: string) => void;
  title: string;
  userIds: string[];
  message: string;
  acceptLabel: string;
  commentLabel: string;
};

export const defaultModalInfo: ModalInfo = {
  action: () => {},
  title: '',
  userIds: [],
  message: '',
  acceptLabel: '',
  commentLabel: ''
};

type setModalInfoParams = {
  type: 'delete' | 'revoke' | 'update';
  action: (comment: string) => void;
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
        commentLabel: `Why do you need to ${type} ${
          plural ? 'these' : 'this'
        } user${plural ? 's' : ''}`
      };
    case 'revoke':
      return {
        action,
        userIds,
        title: 'User revoke',
        message: `The following user${plural ? 's' : ''} will be revoked:`,
        acceptLabel: `REVOKE SESSIONS OF ${nUsers} USER${plural ? 'S' : ''}`,
        commentLabel: `Why do you need to ${type} ${
          plural ? 'these' : 'this'
        } user${plural ? 's' : ''}`
      };
    case 'update':
      return {
        action,
        userIds,
        title: 'User access level update',
        message: `The following user${plural ? 's' : ''} will be updated:`,
        acceptLabel: `UPDATE ${nUsers} USER${plural ? 'S' : ''}`,
        commentLabel: `Why do you need to change access level to ${accessLevel} to ${
          plural ? 'these' : 'this'
        } user${plural ? 's' : ''}`
      };
    default:
      return defaultModalInfo;
  }
}
