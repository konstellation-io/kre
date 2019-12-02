import React from 'react';
import { formatDate } from '../../../../utils/format';

import EmailIcon from '@material-ui/icons/Email';
import TimeIcon from '@material-ui/icons/AccessTime';

import styles from './UserActivityList.module.scss';

import { UserActivity } from '../../../../graphql/models';

const typeToMessage: { [key: string]: string } = {
  LOGIN: 'Has logged in',
  LOGOUT: 'Has logged out',
  CREATE_RUNTIME: 'Has created a Runtime'
};

type Props = {
  data?: UserActivity[];
};

function UserActivityList({ data }: Props) {
  const usersActivity =
    data &&
    data.map((userActivity: UserActivity, idx: number) => {
      return (
        <div
          className={styles.row}
          key={`userActivityListElement${idx}`}
          data-testid={`userActivityListElement${idx}`}
        >
          <div className={styles.userAndMessage}>
            <span className={styles.userWithIcon}>
              <EmailIcon className="icon-regular" />
              <p className={styles.user}>{userActivity.user.email}</p>
            </span>
            <p className={styles.message}>{typeToMessage[userActivity.type]}</p>
          </div>
          <div className={styles.date}>
            <TimeIcon className="icon-regular" />
            <p>{formatDate(new Date(userActivity.date), true)}</p>
          </div>
        </div>
      );
    });

  return <>{usersActivity}</>;
}

export default UserActivityList;
