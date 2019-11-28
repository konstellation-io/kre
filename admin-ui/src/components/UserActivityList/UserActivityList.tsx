import React from 'react';
import { formatDate } from '../../utils/format';

import EmailIcon from '@material-ui/icons/Email';
import Spinner from '../Spinner/Spinner';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import TimeIcon from '@material-ui/icons/AccessTime';

import styles from './UserActivityList.module.scss';

import { useQuery } from '@apollo/react-hooks';
import {
  GET_USERS_ACTIVITY,
  UserActivityResponse
} from './UserActivityList.graphql';
import { UserActivity } from '../../graphql/models';

type Props = {
  filter?: string;
};

function UserActivityList({ filter }: Props) {
  const { data, loading, error } = useQuery<UserActivityResponse>(
    GET_USERS_ACTIVITY
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage />;

  const dataToShow = filter
    ? data &&
      data.usersActivity.filter((element: UserActivity) => {
        return element.user.email.toLowerCase().includes(filter.toLowerCase());
      })
    : data && data.usersActivity;

  const usersActivity =
    dataToShow &&
    dataToShow.map((userActivity: UserActivity, idx: number) => {
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
            <p className={styles.message}>{userActivity.message}</p>
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
