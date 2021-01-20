import ActivityIcon from '../ActivityIcon/ActivityIcon';
import { GetUsersActivity_userActivityList } from 'Graphql/queries/types/GetUsersActivity';
import React from 'react';
import TimeIcon from '@material-ui/icons/AccessTime';
import { formatDate } from 'Utils/format';
import getMessage from './messageGenerator';
import styles from './UserActivityList.module.scss';

type Props = {
  userActivity: GetUsersActivity_userActivityList;
  idx: number;
};
function UserActivityItem({ userActivity, idx }: Props) {
  const [message, comment] = getMessage(userActivity);

  return (
    <div className={styles.row} key={`${userActivity.date}-${idx}`}>
      <div className={styles.date}>
        <div className={styles.dateIcon}>
          <TimeIcon className="icon-small" />
        </div>
        {formatDate(new Date(userActivity.date), true)}
      </div>
      <div className={styles.activityIcon}>
        <ActivityIcon activityType={userActivity.type} />
      </div>
      <div className={styles.info}>
        <p className={styles.user}>{userActivity.user.email}</p>
        <div className={styles.message}>{message}</div>
        {comment && <p className={styles.comment}>{comment}</p>}
      </div>
    </div>
  );
}

export default UserActivityItem;
