import React, { useEffect } from 'react';
import useInput from '../../hooks/useInput';

import SettingsHeader from './components/SettingsHeader';
import TextInput from '../../components/Form/TextInput/TextInput';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import SpinnerCircular from '../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import * as CHECK from '../../components/Form/check';

import cx from 'classnames';
import styles from './Settings.module.scss';

import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  SettingsResponse,
  SettingsVars,
  GET_EXPIRATION_TIME,
  UPDATE_SESSION_LIFETIME
} from './Settings.graphql';

const MIN_EXPIRATION_DAYS = 1;

type FormFieldProps = {
  error: string;
  onChange: Function;
  onBlur: Function;
  defaultValue: any;
};
function FormField({ error, onChange, onBlur, defaultValue }: FormFieldProps) {
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
          defaultValue={defaultValue}
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
  const { data, loading, error: queryError } = useQuery<SettingsResponse>(
    GET_EXPIRATION_TIME,
    { fetchPolicy: 'no-cache' }
  );
  const [updateExpirationTime] = useMutation<SettingsResponse, SettingsVars>(
    UPDATE_SESSION_LIFETIME
  );
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
        <SettingsHeader
          title="General settings"
          subtitle="Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec viverra eleifend
            lacus, vitae ullamcorper metus. Sed sollicitudin ipsum quis nunc sollicitudin ultrices.
            Donec euismod scelerisque ligula. Maecenas eu varius risus, eu aliquet arcu. Curabitur
            fermentum suscipit est, tincidunt."
        />
        <FormField
          error={inputError}
          onChange={onChange}
          onBlur={onSubmit}
          defaultValue={data && data.settings.sessionLifetimeInDays}
        />
      </div>
      {/* <HorizontalBar>
        <Button label={'SAVE CHANGES'} primary onClick={onSubmit} />
      </HorizontalBar> */}
    </>
  );
}

export default GeneralSettings;
