import React, { useState, useEffect } from 'react';
import useForm from '../../hooks/useForm';

import Header from '../../components/Header/Header';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import SettingsHeader from '../Settings/components/SettingsHeader';
import FiltersBar, { typeToText } from './components/FiltersBar/FiltersBar';
import UserActivityList from './components/UserActivityList/UserActivityList';
import * as CHECK from '../../components/Form/check';

import { useQuery } from '@apollo/react-hooks';
import {
  GET_USERS_ACTIVITY,
  GET_USERS,
  UserActivityResponse,
  GetUsersResponse
} from './UsersActivity.graphql';
import { UserActivity, User } from '../../graphql/models';

import cx from 'classnames';
import styles from './UsersActivity.module.scss';
import { Moment } from 'moment';
import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import InfoMessage from '../../components/InfoMessage/InfoMessage';

const N_LIST_ITEMS_STEP = 30;
const ITEM_HEIGHT = 63;
const LIST_STEP_HEIGHT = N_LIST_ITEMS_STEP * ITEM_HEIGHT;
const SCROLL_THRESHOLD = LIST_STEP_HEIGHT * 0.8;
export const ACTION_TYPES = Object.keys(typeToText);

function verifyDate(value: Moment) {
  return CHECK.getValidationError([CHECK.isFieldAMomentDate(value, true)]);
}

function verifyActionType(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldInList(value, ACTION_TYPES, true)
  ]);
}

function getInputs(actionTypeValidator: Function, userValidator: Function) {
  return [
    {
      defaultValue: null,
      verifier: actionTypeValidator,
      id: 'type'
    },
    {
      defaultValue: null,
      verifier: userValidator,
      id: 'userEmail'
    },
    {
      defaultValue: null,
      verifier: verifyDate,
      id: 'fromDate'
    },
    {
      defaultValue: null,
      verifier: verifyDate,
      id: 'toDate'
    }
  ];
}

function UsersActivity() {
  const [nPages, setNPages] = useState(0);

  const { data: usersData, error: usersError } = useQuery<GetUsersResponse>(
    GET_USERS
  );
  const {
    loading,
    data,
    error,
    refetch: getUsersActivity,
    fetchMore
  } = useQuery<UserActivityResponse>(GET_USERS_ACTIVITY);

  const [usersActivityData, setUsersActivityData] = useState<UserActivity[]>(
    []
  );

  const inputs = getInputs(verifyActionType, verifyUser);
  const form = useForm({
    inputElements: inputs,
    fetchFunction: getUsersActivity,
    isQuery: true,
    clearOnSubmit: false
  });

  // As soon as we get new data, we update users activity
  useEffect(() => {
    if (data) {
      setUsersActivityData(data.userActivityList);
    }
  }, [data, setUsersActivityData]);

  function handleOnScroll({ currentTarget }: any) {
    const actualScroll = currentTarget.scrollTop + currentTarget.clientHeight;
    const scrollLimit = SCROLL_THRESHOLD + nPages * LIST_STEP_HEIGHT;

    if (actualScroll >= scrollLimit) {
      setNPages(nPages + 1);

      const lastId = usersActivityData && usersActivityData.slice(-1)[0].id;

      fetchMore({
        query: GET_USERS_ACTIVITY,
        variables: { ...form.getInputVariables(), lastId },
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

  function onSubmit() {
    form.submit();
    setNPages(0);
  }

  const usersList =
    usersData && usersData.users.map((user: User) => user.email);

  function verifyUser(value: string) {
    return CHECK.getValidationError([
      CHECK.isFieldInList(value, usersList || [], true)
    ]);
  }

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
            form={form}
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
