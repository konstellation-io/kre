import React, { useEffect } from 'react';

import { get } from 'lodash';
import Calendar from '../../../../components/Form/Calendar/Calendar';
import Select from '../../../../components/Form/Select/Select';
import Button from '../../../../components/Button/Button';
import SearchSelect from '../../../../components/Form/SearchSelect/SearchSelect';
import * as CHECK from '../../../../components/Form/check';

import styles from './FiltersBar.module.scss';
import { ApolloError } from 'apollo-client';
import { useForm } from 'react-hook-form';
import { Moment } from 'moment';

export const typeToText = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CREATE_RUNTIME: 'Create Runtime',
  CREATE_VERSION: 'Create Version',
  PUBLISH_VERSION: 'Publish Version',
  UNPUBLISH_VERSION: 'Unpublish Version',
  STOP_VERSION: 'Stop Version',
  START_VERSION: 'Start Version',
  UPDATE_SETTING: 'Update Settings',
  UPDATE_VERSION_CONFIGURATION: 'Update Version Configuration'
};

export type UserActivityFormData = {
  type: string;
  userEmail: string;
  fromDate: Moment;
  toDate: Moment;
};

type FormFieldProps = {
  error?: ApolloError;
  onSubmit: (form: UserActivityFormData) => void;
  types: string[];
  users: string[];
};

function FiltersBar({ onSubmit, types, users }: FormFieldProps) {
  const { handleSubmit, register, setValue, errors, watch, reset } = useForm<
    UserActivityFormData
  >({
    reValidateMode: 'onBlur'
  });
  useEffect(() => {
    register({ name: 'type' });
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
    register({ name: 'fromDate' });
    register({ name: 'toDate' });
  }, [users, register]);

  function handleOnSubmit(formData: UserActivityFormData) {
    onSubmit(formData);
  }

  return (
    <form className={styles.formField}>
      <Select
        options={types}
        onChange={(value: string) => setValue('type', value)}
        error={get(errors.type, 'message')}
        formSelectedOption={watch('type')}
        label="Activity type"
        placeholder="Activity type"
        valuesMapper={typeToText}
      />
      <SearchSelect
        name="userEmail"
        options={users}
        onChange={(value: string) => setValue('userEmail', value)}
        placeholder="User email"
        error={get(errors.userEmail, 'message')}
        value={watch('userEmail')}
      />
      <Calendar
        onChangeFromDateInput={(value: Moment) => setValue('fromDate', value)}
        onChangeToDateInput={(value: Moment) => setValue('toDate', value)}
        formFromDate={watch('fromDate')}
        formToDate={watch('toDate')}
        error={get(errors.fromDate, 'message') || get(errors.toDate, 'message')}
        hideError
      />
      <div className={styles.buttons}>
        <Button
          label={'SEARCH'}
          onClick={handleSubmit(handleOnSubmit)}
          border
          style={{ margin: '24px 0' }}
        />
        <Button label={'CLEAR'} onClick={reset} style={{ margin: '24px 0' }} />
      </div>
    </form>
  );
}

export default FiltersBar;
