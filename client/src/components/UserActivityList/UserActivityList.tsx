import React from 'react';

import Spinner from '../Spinner/Spinner';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {ICON} from '../../icons';

import styles from './UserActivityList.module.scss';

import { useQuery } from '@apollo/react-hooks';
import {GET_USERS_ACTIVITY, formatUserActivity, UserActivity} from './dataModels';


const formatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
};
export function toDateTimeString(date:Date) {
  return date.toLocaleString('en-us', formatOptions);
}

type Props = {
  filter?: string;
};

function UserActivityList({
  filter = ''
}: Props) {
  const { data, loading, error } = useQuery(GET_USERS_ACTIVITY);
  if (loading) return <Spinner />;
  if (error) return <p>ERROR</p>;

  const dataFormatted = data.usersActivity.map((element: any) => formatUserActivity(element));

  const dataToShow = filter
    ? dataFormatted.filter((element: UserActivity) => {
      return element.user.toLowerCase().includes(filter.toLowerCase());
    })
    : dataFormatted;

  const usersActivity = dataToShow.map((userActivity:any, idx:number) => {
    const userActivityFormatted = formatUserActivity(userActivity);
    return (
      <div
        className={styles.row}
        key={`userActivityListElement${idx}`}
        data-testid={`userActivityListElement${idx}`}
      >
        <div className={styles.userAndMessage}>
          <span className={styles.userWithIcon}>
            <FontAwesomeIcon icon={ICON.MAIL}/>
            <p className={styles.user}>
              {userActivityFormatted.user}
            </p>
          </span>
          <p className={styles.message}>{userActivityFormatted.message}</p>
        </div>
        <div className={styles.date}>
          <FontAwesomeIcon icon={ICON.CLOCK}/>
          <p>{toDateTimeString(new Date(userActivityFormatted.date))}</p>
        </div>
      </div>
    )
  });

  return (
    <>
      {usersActivity}
    </>
  );
}


export default UserActivityList;
