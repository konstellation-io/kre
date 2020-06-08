import React from 'react';
import Left from '../../../../../../components/Layout/Left/Left';
import Right from '../../../../../../components/Layout/Right/Right';
import UserActions from './UserActions';
import UserFilters from './UserFilters';
import styles from './UserFiltersAndActions.module.scss';
import { AccessLevel } from '../../../../../../graphql/types/globalTypes';
import Button from '../../../../../../components/Button/Button';
import ROUTE from '../../../../../../constants/routes';

type Props = {
  onDeleteUsers: () => void;
  onRevokeUsers: () => void;
  onUpdateUsers: (newAccessLevel: AccessLevel) => void;
};
function UserFiltersAndActions({
  onDeleteUsers,
  onRevokeUsers,
  onUpdateUsers
}: Props) {
  return (
    <div className={styles.container}>
      <Left className={styles.left}>
        <UserFilters />
        <UserActions
          onDeleteUsers={onDeleteUsers}
          onRevokeUsers={onRevokeUsers}
          onUpdateUsers={onUpdateUsers}
        />
      </Left>
      <Right>
        <Button label="NEW USER" to={ROUTE.NEW_USER} border />
      </Right>
    </div>
  );
}

export default UserFiltersAndActions;
