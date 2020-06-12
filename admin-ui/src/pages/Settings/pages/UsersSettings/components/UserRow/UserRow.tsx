import React from 'react';
import Left from '../../../../../../components/Layout/Left/Left';
import Right from '../../../../../../components/Layout/Right/Right';
import { AccessLevel } from '../../../../../../graphql/types/globalTypes';
import styles from './UserRow.module.scss';

type Props = {
  email?: string;
  accessLevel?: AccessLevel;
};

function UserRow({ email, accessLevel }: Props) {
  return (
    <div className={styles.container}>
      <Left>
        <>{email}</>
      </Left>
      <Right className={styles.right}>
        <>{accessLevel}</>
      </Right>
    </div>
  );
}

export default UserRow;
