import React, { useEffect } from 'react';
import useInput from '../../hooks/useInput';

import SettingsHeader from './components/SettingsHeader';
import TextInput from '../../components/Form/TextInput/TextInput';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import * as CHECK from '../../components/Form/check';

import cx from 'classnames';
import styles from './Settings.module.scss';

import { loader } from 'graphql.macro';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { GetSettings } from '../../graphql/queries/types/GetSettings';
import {
  UpdateSettings,
  UpdateSettingsVariables
} from '../../graphql/mutations/types/UpdateSettings';

const GetExpirationTimeQuery = loader(
  '../../graphql/queries/getExpirationTime.graphql'
);
const updateSessionLifetimeMutation = loader(
  '../../graphql/mutations/updateSettings.graphql'
);

const MIN_EXPIRATION_DAYS = 1;

type FormFieldProps = {
  error: string;
  onChange: Function;
  onBlur: Function;
  formValue: any;
};
function FormField({ error, onChange, onBlur, formValue }: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <p className={styles.label}>Session lifetime in days time</p>
      <div className={styles.input}>
        <TextInput
          whiteColor
          onlyNumbers
          positive
          label="nº days"
          error={error}
          onChange={onChange}
          onBlur={onBlur}
          formValue={formValue}
        />
      </div>
    </div>
  );
}

/**
 * Expiration time must be a number (days) between 1 and 60
 */
function isExpirationInvalid(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnInteger(value, true),
    CHECK.isGreaterThan(value, MIN_EXPIRATION_DAYS)
  ]);
}

function GeneralSettings() {
  const { data, loading, error: queryError } = useQuery<GetSettings>(
    GetExpirationTimeQuery
  );
  const [updateExpirationTime] = useMutation<
    UpdateSettings,
    UpdateSettingsVariables
  >(updateSessionLifetimeMutation);
  const { value, isValid, onChange, setValue, error: inputError } = useInput(
    '',
    isExpirationInvalid
  );

  // Sets domains data after receiving API response
  useEffect(() => {
    if (data) {
      setValue(data.settings.sessionLifetimeInDays);
    }
  }, [data, setValue]);

  if (loading) return <SpinnerCircular />;
  if (queryError) return <ErrorMessage />;

  function onSubmit() {
    if (isValid()) {
      const input = {
        sessionLifetimeInDays: parseInt(value)
      };
      updateExpirationTime({ variables: { input } });
    }
  }

  return (
    <>
      <div className={cx(styles.form, styles.generalSettings)}>
        <SettingsHeader title="General settings" />
        <FormField
          error={inputError}
          onChange={onChange}
          onBlur={onSubmit}
          formValue={data && data.settings.sessionLifetimeInDays}
        />
      </div>
      {/* <HorizontalBar>
        <Button label={'SAVE CHANGES'} primary onClick={onSubmit} />
      </HorizontalBar> */}
    </>
  );
}

export default GeneralSettings;
