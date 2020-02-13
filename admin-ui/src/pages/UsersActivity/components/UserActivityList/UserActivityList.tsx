import React from 'react';
import { formatDate } from '../../../../utils/format';
import getMessage from './messageGenerator';

import EmailIcon from '@material-ui/icons/Email';
import TimeIcon from '@material-ui/icons/AccessTime';

import styles from './UserActivityList.module.scss';

import { GetUsersActivity_userActivityList } from '../../../../graphql/queries/types/GetUsersActivity';

type Props = {
  data?: GetUsersActivity_userActivityList[];
};

function UserActivityList({ data }: Props) {
  const usersActivity =
    data &&
    data.map((userActivity: GetUsersActivity_userActivityList, idx: number) => {
      const [message, comment] = getMessage(userActivity);

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
            <p className={styles.message}>{message}</p>
            {comment && <p className={styles.comment}>{comment}</p>}
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
