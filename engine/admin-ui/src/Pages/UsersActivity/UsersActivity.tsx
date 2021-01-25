import { ErrorMessage, GroupSelectData, SpinnerCircular } from 'kwc';
import React, { useEffect } from 'react';
import SelectionsBar, {
  VersionChip
} from './components/SelectionsBar/SelectionsBar';
import { registerMany, unregisterMany } from 'Utils/react-forms';

import FiltersBar from './components/FiltersBar/FiltersBar';
import { GetUsersActivityVariables } from 'Graphql/queries/types/GetUsersActivity';
import { GetVersionConfStatus } from 'Graphql/queries/types/GetVersionConfStatus';
import { Moment } from 'moment';
import PageBase from 'Components/Layout/PageBase/PageBase';
import SettingsHeader from '../Settings/components/SettingsHeader/SettingsHeader';
import UserActivityList from './components/UserActivityList/UserActivityList';
import { UserActivityType } from 'Graphql/types/globalTypes';
import cx from 'classnames';
import { loader } from 'graphql.macro';
import styles from './UsersActivity.module.scss';
import { useForm } from 'react-hook-form';
import { useQuery } from '@apollo/client';

const GetRuntimeAndVersionsQuery = loader(
  'Graphql/queries/getRuntimeAndVersions.graphql'
);

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
  const { data, loading, error } = useQuery<GetVersionConfStatus>(
    GetRuntimeAndVersionsQuery
  );

  const { register, unregister, setValue, errors, watch, reset } = useForm<
    UserActivityFormData
  >({ defaultValues: DEFAULT_FILTERS });

  useEffect(() => {
    const fields = ['types', 'versionIds', 'userEmail', 'fromDate', 'toDate'];
    registerMany(register, fields);

    return () => unregisterMany(unregister, fields);
  }, [register, unregister]);

  if (loading || !data) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  function setAndSubmit(
    field: string,
    newValue: string | GroupSelectData | Moment | UserActivityType[]
  ) {
    setValue(field, newValue);
  }

  function getVersionNames(versionsSelection: GroupSelectData): string[] {
    return Object.entries(versionsSelection)
      .map(([_, versionNames]) => versionNames)
      .flat();
  }

  function getQueryVariables(formData: UserActivityFormData) {
    const queryVars: GetUsersActivityVariables = {
      userEmail: `"${formData.userEmail}"`,
      fromDate: formData.fromDate?.toISOString(),
      toDate: formData.toDate?.toISOString(),
      types: formData.types,
      versionNames: getVersionNames(formData.versionIds),
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

  return (
    <PageBase>
      <div className={styles.container} data-testid="settingsContainer">
        <div className={cx(styles.form, styles.content)}>
          <SettingsHeader>User Audit</SettingsHeader>
          <FiltersBar
            setAndSubmit={setAndSubmit}
            runtimeAndVersions={data}
            watch={watch}
            errors={errors}
            reset={reset}
          />
          <SelectionsBar
            filterValues={{
              userEmail: watch('userEmail'),
              versionIds: watch('versionIds')
            }}
            runtimeAndVersions={data}
            onRemoveFilter={onRemoveFilter}
          />
          <div className={styles.listContainer}>
            <UserActivityList variables={getQueryVariables(watch())} />
          </div>
        </div>
      </div>
    </PageBase>
  );
}

export default UsersActivity;
