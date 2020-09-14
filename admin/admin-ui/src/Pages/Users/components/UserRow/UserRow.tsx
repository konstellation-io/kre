import { Left, Right } from 'kwc';

import { AccessLevel } from 'Graphql/types/globalTypes';
import React from 'react';
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
