import React from 'react';
import IconDelete from '@material-ui/icons/Delete';
import IconRevoke from '@material-ui/icons/HighlightOff';
import UsersTable from './UsersTable';
import { MenuCallToAction } from '../../../../../../components/ContextMenu/ContextMenu';
import { GetUsers_users } from '../../../../../../graphql/queries/types/GetUsers';
import { AccessLevel } from '../../../../../../graphql/types/globalTypes';
import styles from './UserList.module.scss';

type Props = {
  users: GetUsers_users[];
  onDeleteUsers: (user?: [string]) => void;
  onRevokeUsers: (user?: [string]) => void;
  onUpdateAccessLevel: (accessLevel: AccessLevel, user?: [string]) => void;
};
function UserList({
  users,
  onDeleteUsers,
  onRevokeUsers,
  onUpdateAccessLevel
}: Props) {
  const contextMenuActions: MenuCallToAction[] = [
    {
      Icon: IconDelete,
      text: 'delete',
      callToAction: (_: any, userId: string) => onDeleteUsers([userId])
    },
    {
      Icon: IconRevoke,
      text: 'revoke active sessions',
      callToAction: (_: any, userId: string) => onRevokeUsers([userId])
    },
    {
      text: 'change access level to',
      separator: true
    },
    {
      text: 'viewer',
      callToAction: (_: any, userId: string) =>
        onUpdateAccessLevel(AccessLevel.VIEWER, [userId])
    },
    {
      text: 'manager',
      callToAction: (_: any, userId: string) =>
        onUpdateAccessLevel(AccessLevel.MANAGER, [userId])
    },
    {
      text: 'administrator',
      callToAction: (_: any, userId: string) =>
        onUpdateAccessLevel(AccessLevel.ADMIN, [userId])
    }
  ];

  return (
    <div className={styles.container}>
      <UsersTable users={users} contextMenuActions={contextMenuActions} />
    </div>
  );
}

export default UserList;
