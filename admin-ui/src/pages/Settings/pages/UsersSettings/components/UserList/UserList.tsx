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
  onUpdateUsers: (accessLevel: AccessLevel, user?: [string]) => void;
};
function UserList({
  users,
  onDeleteUsers,
  onRevokeUsers,
  onUpdateUsers
}: Props) {
  const contextMenuActions: MenuCallToAction[] = [
    {
      Icon: IconDelete,
      text: 'delete',
      callToAction: (_: any, userId: string) => onDeleteUsers([userId])
    },
    {
      Icon: IconRevoke,
      text: 'revoke access',
      callToAction: (_: any, userId: string) => onRevokeUsers([userId])
    },
    {
      text: 'change user type to',
      separator: true
    },
    {
      text: 'viewer',
      callToAction: (_: any, userId: string) =>
        onUpdateUsers(AccessLevel.VIEWER, [userId])
    },
    {
      text: 'manager',
      callToAction: (_: any, userId: string) =>
        onUpdateUsers(AccessLevel.MANAGER, [userId])
    },
    {
      text: 'administrator',
      callToAction: (_: any, userId: string) =>
        onUpdateUsers(AccessLevel.ADMIN, [userId])
    }
  ];

  return (
    <div className={styles.container}>
      <UsersTable users={users} contextMenuActions={contextMenuActions} />
    </div>
  );
}

export default UserList;
