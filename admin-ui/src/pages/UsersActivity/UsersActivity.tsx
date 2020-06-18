import React, { useState, useEffect } from 'react';
import SettingsHeader from '../Settings/components/SettingsHeader/SettingsHeader';
import FiltersBar from './components/FiltersBar/FiltersBar';
import SelectionsBar, {
  VersionChip
} from './components/SelectionsBar/SelectionsBar';
import UserActivityList from './components/UserActivityList/UserActivityList';
import { GetUsersActivityVariables } from '../../graphql/queries/types/GetUsersActivity';
import { UserActivityType } from '../../graphql/types/globalTypes';
import cx from 'classnames';
import styles from './UsersActivity.module.scss';
import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import PageBase from '../../components/Layout/PageBase/PageBase';
import useAllVersions from '../../hooks/useAllVersions';
import { GroupSelectData } from '../../components/Form/GroupSelect/GroupSelect';
import { Moment } from 'moment';
import { useForm } from 'react-hook-form';
import { registerMany, unregisterMany } from '../../utils/react-forms';

export type UserActivityFormData = {
  types: UserActivityType[];
  versionIds: GroupSelectData;
  userEmail: string;
  fromDate: Moment;
  toDate: Moment;
};

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

// DOING: CHECK if vars are correct in all queries/requeries

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

function UsersActivity() {
  const [filterValues, setFilterValues] = useState<UserActivityFormData>();
  const {
    handleSubmit,
    register,
    unregister,
    setValue,
    errors,
    watch,
    reset
  } = useForm<UserActivityFormData>();

  useEffect(() => {
    const fields = ['types', 'versionIds', 'userEmail', 'fromDate', 'toDate'];
    registerMany(register, fields);

    return () => unregisterMany(unregister, fields);
  }, [register, unregister]);

  const {
    data: versionsData,
    loading: versionsLoading,
    error: versionsError
  } = useAllVersions();

  function handleReset() {
    reset();
    setFilterValues(undefined);
  }

  function setAndSubmit(
    field: string,
    newValue: string | GroupSelectData | Moment | UserActivityType[]
  ) {
    setValue(field, newValue);
    handleSubmit((formData: UserActivityFormData) =>
      setFilterValues(formData)
    )();
  }

  function getQueryVariables(data: UserActivityFormData | undefined) {
    if (data?.versionIds)
      return { ...data, versionIds: Object.values(data.versionIds).flat() };

    return data ?? {};
  }

  const versionIds = watch('versionIds');
  function onRemoveFilter(filter: string, value: string | VersionChip) {
    switch (filter) {
      case 'userEmail':
        setAndSubmit('userEmail', '');
        break;
      case 'runtime':
        delete versionIds[value as string];
        setAndSubmit('versionIds', versionIds);
        break;
      case 'version':
        const runtimeName = (value as VersionChip).runtime;
        const versionName = (value as VersionChip).version;
        versionIds[runtimeName].splice(
          versionIds[runtimeName].indexOf(versionName),
          1
        );
        setAndSubmit('versionIds', versionIds);
        break;
    }
  }

  function renderContent() {
    if (versionsLoading) return <SpinnerCircular />;
    if (versionsError) return <ErrorMessage />;

    return <UserActivityList variables={getQueryVariables(filterValues)} />;
  }

  return (
    <PageBase>
      <div className={styles.container} data-testid="settingsContainer">
        <div className={cx(styles.form, styles.content)}>
          <SettingsHeader>User Audit</SettingsHeader>
          <FiltersBar
            setAndSubmit={setAndSubmit}
            runtimesAndVersions={versionsData ?? []}
            watch={watch}
            errors={errors}
            reset={handleReset}
          />
          <SelectionsBar
            filterValues={{
              userEmail: filterValues?.userEmail || '',
              versionIds: filterValues?.versionIds || {}
            }}
            runtimesAndVersions={versionsData ?? []}
            onRemoveFilter={onRemoveFilter}
          />
          {renderContent()}
        </div>
      </div>
    </PageBase>
  );
}

export default UsersActivity;
