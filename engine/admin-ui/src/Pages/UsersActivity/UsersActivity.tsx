import { ErrorMessage, GroupSelectData, SpinnerCircular } from 'kwc';
import React, { useEffect } from 'react';
import SelectionsBar, {
  VersionChip
} from './components/SelectionsBar/SelectionsBar';
import { registerMany, unregisterMany } from 'Utils/react-forms';
import FiltersBar from './components/FiltersBar/FiltersBar';
import { GetUsersActivityVariables } from 'Graphql/queries/types/GetUsersActivity';
import { Moment } from 'moment';
import PageBase from 'Components/Layout/PageBase/PageBase';
import SettingsHeader from '../Settings/components/SettingsHeader/SettingsHeader';
import UserActivityList from './components/UserActivityList/UserActivityList';
import { UserActivityType } from 'Graphql/types/globalTypes';
import cx from 'classnames';
import styles from './UsersActivity.module.scss';
import { useForm } from 'react-hook-form';
import useAllVersions from "Hooks/useAllVersions";

export type UserActivityFormData = {
  types: UserActivityType[];
  versionIds: GroupSelectData;
  userEmail: string;
  fromDate: Moment | undefined;
  toDate: Moment | undefined;
};

const DEFAULT_FILTERS: UserActivityFormData = {
  types: [],
  versionIds: {},
  userEmail: '',
  fromDate: undefined,
  toDate: undefined
};

function UsersActivity() {
  const { register, unregister, setValue, errors, watch, reset } = useForm<
    UserActivityFormData
  >({ defaultValues: DEFAULT_FILTERS });

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

  function setAndSubmit(
    field: string,
    newValue: string | GroupSelectData | Moment | UserActivityType[]
  ) {
    setValue(field, newValue);
  }

  function getVersionIds(versionsSelection: GroupSelectData): string[] {
    return Object.entries(versionsSelection)
      .map(([runtimeName, versionNames]) =>
        versionNames.map(versionName => getVersionId(runtimeName, versionName))
      )
      .flat();
  }

  function getQueryVariables(formData: UserActivityFormData) {
    const queryVars: GetUsersActivityVariables = {
      userEmail: `"${formData.userEmail}"`,
      fromDate: formData.fromDate?.toISOString(),
      toDate: formData.toDate?.toISOString(),
      types: formData.types,
      versionIds: getVersionIds(formData.versionIds),
      lastId: null
    };

    return queryVars;
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
        <UserActivityList variables={getQueryVariables(watch())} />
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
            reset={reset}
          />
          <SelectionsBar
            filterValues={{
              userEmail: watch('userEmail'),
              versionIds: watch('versionIds')
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
