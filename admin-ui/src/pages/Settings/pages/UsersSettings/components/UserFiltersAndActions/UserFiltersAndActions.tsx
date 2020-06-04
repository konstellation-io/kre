import React from 'react';
import Left from '../../../../../../components/Layout/Left/Left';
import Right from '../../../../../../components/Layout/Right/Right';
import UserActions from './UserActions';
import UserFilters from './UserFilters';
import styles from './UserFiltersAndActions.module.scss';

function UserFiltersAndActions() {
  return (
    <div className={styles.container}>
      <Left>
        <UserFilters />
      </Left>
      <Right>
        <UserActions nSelections={999999} />
      </Right>
    </div>
  );
}

export default UserFiltersAndActions;
