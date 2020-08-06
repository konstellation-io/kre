import {
  Button,
  Calendar,
  GroupSelect,
  GroupSelectData,
  MultiSelect,
  SearchSelect
} from 'kwc';
import CustomLabel, { HIGHLIGHT_COLORS } from './CustomLabel';
import { FieldError, NestDataObject } from 'react-hook-form';

import ActivityIcon from '../ActivityIcon/ActivityIcon';
import { ErrorMessage } from 'kwc';
import { GetUsers } from 'Graphql/queries/types/GetUsers';
import { GetUsersActivity_userActivityList_user } from 'Graphql/queries/types/GetUsersActivity';
import { Moment } from 'moment';
import React from 'react';
import { UserActivityFormData } from '../../UsersActivity';
import { UserActivityType } from 'Graphql/types/globalTypes';
import { VersionsData } from 'Hooks/useAllVersions';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import styles from './FiltersBar.module.scss';
import { useQuery } from '@apollo/client';

const GetUsersQuery = loader('Graphql/queries/getUsers.graphql');

const customLabels = new Map([
  [UserActivityType.LOGIN, <CustomLabel>Login</CustomLabel>],
  [UserActivityType.LOGOUT, <CustomLabel>Logout</CustomLabel>],
  [UserActivityType.CREATE_RUNTIME, <CustomLabel>Runtime created</CustomLabel>],
  [UserActivityType.CREATE_VERSION, <CustomLabel>Version Created</CustomLabel>],
  [
    UserActivityType.PUBLISH_VERSION,
    <CustomLabel highlight="published" color={HIGHLIGHT_COLORS.DEFAULT}>
      Version published
    </CustomLabel>
  ],
  [
    UserActivityType.UNPUBLISH_VERSION,
    <CustomLabel highlight="unpublished" color={HIGHLIGHT_COLORS.INFO}>
      Version unpublished
    </CustomLabel>
  ],
  [
    UserActivityType.STOP_VERSION,
    <CustomLabel highlight="stopped" color={HIGHLIGHT_COLORS.GREY}>
      Version stopped
    </CustomLabel>
  ],
  [
    UserActivityType.START_VERSION,
    <CustomLabel highlight="started" color={HIGHLIGHT_COLORS.SUCCESS}>
      Version started
    </CustomLabel>
  ],
  [
    UserActivityType.UPDATE_SETTING,
    <CustomLabel>Settings updated</CustomLabel>
  ],
  [
    UserActivityType.UPDATE_VERSION_CONFIGURATION,
    <CustomLabel>Version conf. changed</CustomLabel>
  ],
  [UserActivityType.CREATE_USER, <CustomLabel>User created</CustomLabel>],
  [UserActivityType.REMOVE_USERS, <CustomLabel>Users removed</CustomLabel>],
  [
    UserActivityType.UPDATE_ACCESS_LEVELS,
    <CustomLabel>Users updated</CustomLabel>
  ],
  [UserActivityType.REVOKE_SESSIONS, <CustomLabel>Session revoked</CustomLabel>]
]);

const multiSelectOptions = Object.values(UserActivityType).map(type => ({
  label: type,
  Icon: <ActivityIcon activityType={type} invert />
}));

type FormFieldProps = {
  setAndSubmit: (
    field: string,
    newValue: string | GroupSelectData | Moment | UserActivityType[]
  ) => void;
  runtimesAndVersions: VersionsData[];
  watch: Function;
  errors: NestDataObject<UserActivityFormData, FieldError>;
  reset: Function;
};
function FiltersBar({
  setAndSubmit,
  runtimesAndVersions,
  watch,
  errors,
  reset
}: FormFieldProps) {
  const { data: usersData, error: usersError } = useQuery<GetUsers>(
    GetUsersQuery
  );
  const users =
    (usersData &&
      usersData.users.map(
        (user: GetUsersActivity_userActivityList_user) => user.email
      )) ||
    [];

  if (usersError) return <ErrorMessage />;

  function onTypeSelection(newtypes: UserActivityType[]) {
    setAndSubmit('types', newtypes);
  }

  const versionOptions = Object.fromEntries(
    runtimesAndVersions.map(({ runtime: { name: runtimeName }, versions }) => [
      runtimeName,
      versions.map(v => v.name)
    ])
  );

  return (
    <form className={styles.formField}>
      <div>
        <SearchSelect
          name="userEmail"
          label="search a user"
          options={users}
          onChange={(value: string) => setAndSubmit('userEmail', value)}
          placeholder="User email"
          error={get(errors.userEmail, 'message') as string}
          value={watch('userEmail')}
        />
      </div>
      <div>
        <GroupSelect
          label="filter by versions"
          options={versionOptions}
          formSelectedOptions={watch('versionIds')}
          onChange={newSelection => setAndSubmit('versionIds', newSelection)}
          placeholder="Select Versions"
          hideSelections
        />
      </div>
      <div>
        <MultiSelect<UserActivityType>
          options={multiSelectOptions}
          onChange={onTypeSelection}
          error={get(errors.types, 'message')}
          formSelectedOptions={watch('types')}
          label="Activity type"
          placeholder="ALL TYPES"
          selectionUnit="TYPE"
          selectAllText="ALL TYPES"
          customLabels={customLabels}
          iconAtStart
        />
      </div>
      <div>
        <Calendar
          label="dates selection"
          onChangeFromDateInput={(value: Moment) =>
            setAndSubmit('fromDate', value)
          }
          onChangeToDateInput={(value: Moment) => setAndSubmit('toDate', value)}
          formFromDate={watch('fromDate')}
          formToDate={watch('toDate')}
          error={
            get(errors.fromDate, 'message') || get(errors.toDate, 'message')
          }
        />
      </div>
      <div className={styles.buttons}>
        <Button
          label={'CLEAR'}
          onClick={() => reset()}
          style={{ margin: '24px 0' }}
        />
      </div>
    </form>
  );
}

export default FiltersBar;
