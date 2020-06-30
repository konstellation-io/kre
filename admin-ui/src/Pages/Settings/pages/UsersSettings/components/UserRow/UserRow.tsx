import { AccessLevel } from 'Graphql/types/globalTypes';
import Left from 'Components/Layout/Left/Left';
import React from 'react';
import Right from 'Components/Layout/Right/Right';
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
