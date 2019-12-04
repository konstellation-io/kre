import React from 'react';

import Calendar from '../../../../components/Form/Calendar/Calendar';
import Select from '../../../../components/Form/Select/Select';
import Button from '../../../../components/Button/Button';
import { Form } from '../../../../hooks/useForm';

import styles from './FiltersBar.module.scss';
import { ApolloError } from 'apollo-client';

const typeToText = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CREATE_RUNTIME: 'Runtime Creation'
};

type FormFieldProps = {
  error?: ApolloError;
  form: Form;
  onSubmit: Function;
  types: string[];
  users: string[];
};
function FiltersBar({ form, onSubmit, types, users }: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <Select
        options={types}
        onChange={form.input.type.onChange}
        error={form.input.type.error}
        formSelectedOption={form.input.type.value}
        label="Activity type"
        placeholder="Activity type"
        valuesMapper={typeToText}
      />
      <Select
        options={users}
        onChange={form.input.userEmail.onChange}
        error={form.input.userEmail.error}
        formSelectedOption={form.input.userEmail.value}
        label="User email"
        placeholder="User email"
      />
      <Calendar
        onChangeFromDate={form.input.fromDate.onChange}
        onChangeToDate={form.input.toDate.onChange}
        formFromDate={form.input.fromDate.value}
        formToDate={form.input.toDate.value}
        error={form.input.fromDate.error || form.input.toDate.error}
      />
      <div className={styles.buttons}>
        <Button
          label={'SEARCH'}
          onClick={onSubmit}
          border
          style={{ margin: '24px 0' }}
        />
        <Button
          label={'CLEAR'}
          onClick={() => {
            form.clearInputs(true);
          }}
          style={{ margin: '24px 0' }}
        />
      </div>
    </div>
  );
}

export default FiltersBar;
