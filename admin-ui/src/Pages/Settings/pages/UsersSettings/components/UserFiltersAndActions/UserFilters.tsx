import React, { useEffect } from 'react';
import { useApolloClient, useQuery } from '@apollo/react-hooks';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { GetUsers } from 'Graphql/queries/types/GetUsers';
import SearchSelect from 'Components/Form/SearchSelect/SearchSelect';
import Select from 'Components/Form/Select/Select';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import styles from './UserFiltersAndActions.module.scss';
import { useForm } from 'react-hook-form';

const GetUsersQuery = loader(
  '../../../../../../Graphql/queries/getUsers.graphql'
);

type FormData = {
  userEmail?: string;
  userType?: AccessLevel;
};

function UserFilters() {
  const client = useApolloClient();
  const { data } = useQuery<GetUsers>(GetUsersQuery);

  const { handleSubmit, register, setValue, errors, watch } = useForm<
    FormData
  >();

  const users = [...new Set(data?.users.map(user => user.email))];
  const types = Object.values(AccessLevel);

  useEffect(() => {
    register({ name: 'userEmail' });
    register({ name: 'userType' });
  }, [users, register]);

  function onSubmit(formData: FormData) {
    client.writeData({
      data: {
        userSettings: {
          filters: {
            email: formData.userEmail || null,
            accessLevel: formData.userType || null,
            __typename: 'UserSettingsFilters'
          },
          __typename: 'UserSettings'
        }
      }
    });
  }

  return (
    <div className={styles.filters}>
      <div className={styles.filterUsers}>
        <SearchSelect
          label="Search"
          name="userEmail"
          options={users}
          onChange={(value: string) => setValue('userEmail', value)}
          onEnter={handleSubmit(onSubmit)}
          placeholder="User email"
          error={get(errors.userEmail, 'message')}
          value={watch('userEmail')}
        />
      </div>
      <div className={styles.filterTypes}>
        <Select
          label="User type"
          options={types}
          onChange={(value: AccessLevel) => {
            setValue('userType', value);
            handleSubmit(onSubmit)();
          }}
          error={get(errors.userType, 'message')}
          formSelectedOption={watch('userType')}
          placeholder="Activity type"
        />
      </div>
    </div>
  );
}

export default UserFilters;
