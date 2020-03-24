import React, { useState, useEffect, UIEvent } from 'react';

import Header from '../../components/Header/Header';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import SettingsHeader from '../Settings/components/SettingsHeader/SettingsHeader';
import FiltersBar, { typeToText } from './components/FiltersBar/FiltersBar';
import UserActivityList from './components/UserActivityList/UserActivityList';

import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import {
  GetUsersActivity,
  GetUsersActivity_userActivityList,
  GetUsersActivity_userActivityList_user
} from '../../graphql/queries/types/GetUsersActivity';
import { GetUsers } from '../../graphql/queries/types/GetUsers';

import cx from 'classnames';
import styles from './UsersActivity.module.scss';
import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import InfoMessage from '../../components/InfoMessage/InfoMessage';
import { queryPayloadHelper } from '../../utils/formUtils';

const GetUsersQuery = loader('../../graphql/queries/getUsers.graphql');
const GetUserActivityQuery = loader(
  '../../graphql/queries/getUserActivity.graphql'
);

const N_LIST_ITEMS_STEP = 30;
const ITEM_HEIGHT = 63;
const LIST_STEP_HEIGHT = N_LIST_ITEMS_STEP * ITEM_HEIGHT;
const SCROLL_THRESHOLD = LIST_STEP_HEIGHT * 0.8;
export const ACTION_TYPES = Object.keys(typeToText);

function UsersActivity() {
  const [nPages, setNPages] = useState(0);

  const { data: usersData, error: usersError } = useQuery<GetUsers>(
    GetUsersQuery
  );
  const {
    loading,
    data,
    error,
    refetch: getUsersActivity,
    fetchMore
  } = useQuery<GetUsersActivity>(GetUserActivityQuery, {
    fetchPolicy: 'no-cache'
  });

  const [usersActivityData, setUsersActivityData] = useState<
    GetUsersActivity_userActivityList[]
  >([]);

  const [filterValues, setFilterValues] = useState({});

  // As soon as we get new data, we update users activity
  useEffect(() => {
    if (data) {
      setUsersActivityData(data.userActivityList);
    }
  }, [data, setUsersActivityData]);

  function handleOnScroll({ currentTarget }: UIEvent<HTMLDivElement>) {
    const actualScroll = currentTarget.scrollTop + currentTarget.clientHeight;
    const scrollLimit = SCROLL_THRESHOLD + nPages * LIST_STEP_HEIGHT;

    if (actualScroll >= scrollLimit) {
      setNPages(nPages + 1);

      const lastId = usersActivityData && usersActivityData.slice(-1)[0].id;

      fetchMore({
        query: GetUserActivityQuery,
        variables: { ...filterValues, lastId },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const prevData = previousResult.userActivityList;
          const newData = fetchMoreResult && fetchMoreResult.userActivityList;

          return {
            userActivityList: [...prevData, ...(newData || [])]
          };
        }
      });
    }
  }

  function onSubmit(data: any) {
    setFilterValues(data);
    getUsersActivity(queryPayloadHelper(data));
    setNPages(0);
  }

  const usersList =
    usersData &&
    usersData.users.map(
      (user: GetUsersActivity_userActivityList_user) => user.email
    );

  let content = <UserActivityList data={usersActivityData} />;
  if (loading) content = <SpinnerCircular />;
  if (error || usersError) content = <ErrorMessage />;
  if (usersActivityData.length === 0) {
    content = <InfoMessage message="No activity with the specified filters" />;
  }

  return (
    <>
      <Header />
      <div className={styles.container} data-testid="settingsContainer">
        <NavigationBar />
        <div className={cx(styles.form, styles.content)}>
          <SettingsHeader title="User Audit" />
          <FiltersBar
            error={error}
            onSubmit={onSubmit}
            types={ACTION_TYPES}
            users={usersList || []}
          />
          <div className={styles.elements} onScroll={handleOnScroll}>
            {content}
          </div>
        </div>
      </div>
    </>
  );
}

export default UsersActivity;
