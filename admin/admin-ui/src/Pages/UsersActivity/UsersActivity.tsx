import { ErrorMessage, GroupSelectData, SpinnerCircular } from 'kwc';
import React, { useEffect, useState } from 'react';
import SelectionsBar, {
  VersionChip
} from './components/SelectionsBar/SelectionsBar';
import { registerMany, unregisterMany } from 'Utils/react-forms';

import FiltersBar from './components/FiltersBar/FiltersBar';
import { Moment } from 'moment';
import PageBase from 'Components/Layout/PageBase/PageBase';
import SettingsHeader from '../Settings/components/SettingsHeader/SettingsHeader';
import UserActivityList from './components/UserActivityList/UserActivityList';
import { UserActivityType } from 'Graphql/types/globalTypes';
import cx from 'classnames';
import styles from './UsersActivity.module.scss';
import useAllVersions from 'Hooks/useAllVersions';
import { useForm } from 'react-hook-form';

export type UserActivityFormData = {
  types: UserActivityType[];
  versionIds: GroupSelectData;
  userEmail: string;
  fromDate: Moment;
  toDate: Moment;
};

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
    error: versionsError,
    getVersionId
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

  function getVersionIds(versionsSelection: GroupSelectData) {
    return Object.entries(versionsSelection)
      .map(([runtimeName, versionNames]) =>
        versionNames.map(versionName => getVersionId(runtimeName, versionName))
      )
      .flat();
  }

  function getQueryVariables(data: UserActivityFormData | undefined) {
    if (data?.versionIds)
      return { ...data, versionIds: getVersionIds(data.versionIds) };

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

    return (
      <div className={styles.listContainer}>
        <UserActivityList variables={getQueryVariables(filterValues)} />
      </div>
    );
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
