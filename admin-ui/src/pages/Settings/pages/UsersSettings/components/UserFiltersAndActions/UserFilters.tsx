import React, { useEffect } from 'react';
import * as CHECK from '../../../../../../components/Form/check';
import { useForm } from 'react-hook-form';
import Select from '../../../../../../components/Form/Select/Select';
import SearchSelect from '../../../../../../components/Form/SearchSelect/SearchSelect';
import styles from './UserFiltersAndActions.module.scss';
import { get } from 'lodash';

function UserFilters() {
  const {
    handleSubmit,
    register,
    setValue,
    errors,
    watch,
    getValues
  } = useForm();

  const users = ['a', 'b', 'c', 'd', 'e', 'f'];
  const types = ['1', '2', '3', '4', '5', '6'];

  useEffect(() => {
    register(
      { name: 'userEmail' },
      {
        validate: (value: string) => {
          return CHECK.getValidationError([
            CHECK.isFieldNotInList(
              value,
              users,
              true,
              'The user must be from the list'
            )
          ]);
        }
      }
    );
    register({ name: 'userType' });
  }, [users, register]);

  return (
    <div className={styles.filters}>
      <div className={styles.filterUsers}>
        <SearchSelect
          label="Search"
          name="userEmail"
          options={users}
          onChange={(value: string) => setValue('userEmail', value)}
          placeholder="User email"
          error={get(errors.userEmail, 'message')}
          value={watch('userEmail')}
        />
      </div>
      <div className={styles.filterTypes}>
        <Select
          label="User type"
          options={types}
          onChange={(value: string) => setValue('userType', value)}
          error={get(errors.userType, 'message')}
          formSelectedOption={watch('userType')}
          placeholder="Activity type"
          // valuesMapper={typeToText}
        />
      </div>
    </div>
  );
}

export default UserFilters;
