import React, { useState, useEffect } from 'react';
import useForm from '../../hooks/useForm';

import Header from '../../components/Header/Header';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import SettingsHeader from '../Settings/components/SettingsHeader';
import FiltersBar from './components/FiltersBar/FiltersBar';
import UserActivityList from './components/UserActivityList/UserActivityList';
import * as CHECK from '../../components/Form/check';

import { useQuery } from '@apollo/react-hooks';
import {
  GET_USERS_ACTIVITY,
  UserActivityResponse
} from './UsersActivity.graphql';
import { UserActivity } from '../../graphql/models';

import cx from 'classnames';
import styles from './UsersActivity.module.scss';
import { Moment } from 'moment';
import Spinner from '../../components/Spinner/Spinner';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';

function verifyDate(value: Moment) {
  return CHECK.getValidationError([CHECK.isFieldAMomentDate(value, true)]);
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
      id: 'email'
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

/**
 * Given users activity data, extracts unique types and users.
 */
function getTypesAndUsers(usersActivityData: any) {
  const types = new Set(),
    users = new Set();

  usersActivityData.forEach((activityData: UserActivity) => {
    types.add(activityData.type);
    users.add(activityData.user.email);
  });

  const typesList = Array.from(types) as string[];
  const usersList = Array.from(users) as string[];

  return [typesList, usersList];
}

function UsersActivity() {
  const { loading, data, error, refetch: getUsersActivity } = useQuery<
    UserActivityResponse
  >(GET_USERS_ACTIVITY);

  const [usersActivityData, setUsersActivityData] = useState<UserActivity[]>(
    []
  );

  const inputs = getInputs(verifyActionType, verifyUser);
  const form = useForm({
    inputElements: inputs,
    fetchFunction: getUsersActivity,
    isQuery: true
  });

  // As soon as we get new data, we update users activity
  useEffect(() => {
    if (data) {
      setUsersActivityData(data.usersActivity);
    }
  }, [data, setUsersActivityData]);

  const [typesList, usersList] = getTypesAndUsers(usersActivityData);

  function verifyActionType(value: string) {
    return CHECK.getValidationError([
      CHECK.isFieldInList(value, typesList, true)
    ]);
  }
  function verifyUser(value: string) {
    return CHECK.getValidationError([
      CHECK.isFieldInList(value, usersList, true)
    ]);
  }

  let content = <UserActivityList data={usersActivityData} />;
  if (loading) content = <Spinner />;
  if (error) content = <ErrorMessage />;

  return (
    <>
      <Header />
      <div className={styles.container} data-testid="settingsContainer">
        <NavigationBar />
        <div className={cx(styles.form, styles.content)}>
          <SettingsHeader
            title="Audit. User History."
            subtitle="Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec viverra eleifend
            lacus, vitae ullamcorper metus. Sed sollicitudin ipsum quis nunc sollicitudin ultrices.
            Donec euismod scelerisque ligula. Maecenas eu varius risus, eu aliquet arcu. Curabitur
            fermentum suscipit est, tincidunt."
          />
          <FiltersBar
            error={error}
            form={form}
            onSubmit={() => form.submit()}
            types={typesList}
            users={usersList}
          />
          <div className={styles.elements}>{content}</div>
        </div>
      </div>
    </>
  );
}

export default UsersActivity;
