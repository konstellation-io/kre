import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Select from '../../../../../../components/Form/Select/Select';
import SearchSelect from '../../../../../../components/Form/SearchSelect/SearchSelect';
import styles from './UserFiltersAndActions.module.scss';
import { get } from 'lodash';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { GetUsers } from '../../../../../../graphql/queries/types/GetUsers';
import { loader } from 'graphql.macro';
import { AccessLevel } from '../../../../../../graphql/types/globalTypes';

const GetUsersQuery = loader(
  '../../../../../../graphql/queries/getUsers.graphql'
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
