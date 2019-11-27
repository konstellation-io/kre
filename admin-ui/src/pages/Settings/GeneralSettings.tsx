import React, { useEffect } from 'react';
import useInput from '../../hooks/useInput';

import SettingsHeader from './components/SettingsHeader';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import HorizontalBar from '../../components/Layout/HorizontalBar/HorizontalBar';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';
import Spinner from '../../components/Spinner/Spinner';
import * as CHECK from '../../components/Form/check';

import cx from 'classnames';
import styles from './Settings.module.scss';

import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  GET_EXPIRATION_TIME,
  UPDATE_EXPIRATION_TIME
} from './Settings.graphql';

const MIN_EXPIRATION_DAYS = 1;
const MAX_EXPIRATION_DAYS = 60;

type FormFieldProps = {
  error: string;
  onChange: Function;
  onSubmit: Function;
  defaultValue: any;
};
function FormField({
  error,
  onChange,
  onSubmit,
  defaultValue
}: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <p className={styles.label}>Session Cookie expiration time</p>
      <div className={styles.input}>
        <TextInput
          whiteColor
          onlyNumbers
          label="nº days"
          error={error}
          onChange={onChange}
          onSubmit={onSubmit}
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
    CHECK.isIntegerWithinRange(value, [
      MIN_EXPIRATION_DAYS,
      MAX_EXPIRATION_DAYS
    ])
  ]);
}

function GeneralSettings() {
  const { data, loading, error: queryError } = useQuery(GET_EXPIRATION_TIME);
  const [updateExpirationTime] = useMutation(UPDATE_EXPIRATION_TIME);
  const { value, isValid, onChange, setValue, error: inputError } = useInput(
    '',
    isExpirationInvalid
  );

  // Sets domains data after receiving API response
  useEffect(() => {
    if (data) {
      setValue(data.settings.cookieExpirationTime);
    }
  }, [data, setValue]);

  if (loading) return <Spinner />;
  if (queryError) return <ErrorMessage />;

  function onSubmit() {
    if (isValid()) {
      const input = {
        cookieExpirationTime: parseInt(value)
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
          onSubmit={onSubmit}
          defaultValue={data.settings.cookieExpirationTime}
        />
      </div>
      <HorizontalBar>
        <Button label={'SAVE CHANGES'} primary onClick={onSubmit} />
      </HorizontalBar>
    </>
  );
}

export default GeneralSettings;
