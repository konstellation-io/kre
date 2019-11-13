import React from 'react';
import { formatDate } from '../../utils/format';

import Spinner from '../Spinner/Spinner';

import EmailIcon from '@material-ui/icons/Email';
import TimeIcon from '@material-ui/icons/AccessTime';

import styles from './UserActivityList.module.scss';

import { useQuery } from '@apollo/react-hooks';
import {
  GET_USERS_ACTIVITY,
  formatUserActivity,
  UserActivity
} from './dataModels';

type Props = {
  filter?: string;
};

function UserActivityList({ filter = '' }: Props) {
  const { data, loading, error } = useQuery(GET_USERS_ACTIVITY);
  if (loading) return <Spinner />;
  if (error) return <p>ERROR</p>;

  const dataFormatted = data.usersActivity.map((element: any) =>
    formatUserActivity(element)
  );

  const dataToShow = filter
    ? dataFormatted.filter((element: UserActivity) => {
        return element.user.toLowerCase().includes(filter.toLowerCase());
      })
    : dataFormatted;

  const usersActivity = dataToShow.map((userActivity: any, idx: number) => {
    const userActivityFormatted = formatUserActivity(userActivity);
    return (
      <div
        className={styles.row}
        key={`userActivityListElement${idx}`}
        data-testid={`userActivityListElement${idx}`}
      >
        <div className={styles.userAndMessage}>
          <span className={styles.userWithIcon}>
            <EmailIcon style={{ fontSize: '1rem' }} />
            <p className={styles.user}>{userActivityFormatted.user}</p>
          </span>
          <p className={styles.message}>{userActivityFormatted.message}</p>
        </div>
        <div className={styles.date}>
          <TimeIcon style={{ fontSize: '1rem' }} />
          <p>{formatDate(new Date(userActivityFormatted.date), true)}</p>
        </div>
      </div>
    );
  });

  return <>{usersActivity}</>;
}

export default UserActivityList;
