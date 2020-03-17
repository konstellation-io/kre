import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { get } from 'lodash';

import SettingsHeader from './components/SettingsHeader';
import TextInput, {
  InputType
} from '../../components/Form/TextInput/TextInput';
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
import { mutationPayloadHelper } from '../../utils/formUtils';

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
  formValue: string | number | undefined;
};
function FormField({ error, onChange, onBlur, formValue }: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <p className={styles.label}>Session lifetime in days time</p>
      <div className={styles.input}>
        <TextInput
          whiteColor
          type={InputType.NUMBER}
          additionalInputProps={{ min: 0 }}
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
  >(updateSessionLifetimeMutation, {
    update(cache, { data }) {
      if (data && data.updateSettings) {
        cache.writeQuery({
          query: GetExpirationTimeQuery,
          data: { settings: data.updateSettings }
        });
      }
    }
  });
  const { handleSubmit, setValue, register, errors } = useForm();
  useEffect(() => {
    register('sessionLifetimeInDays', { validate: isExpirationInvalid });
    setValue('sessionLifetimeInDays', '');
  }, [register, setValue]);

  // Sets domains data after receiving API response
  useEffect(() => {
    if (data) {
      setValue('sessionLifetimeInDays', data.settings.sessionLifetimeInDays);
    }
  }, [data, setValue]);

  if (loading) return <SpinnerCircular />;
  if (queryError) return <ErrorMessage />;

  function onSubmit(formData: any) {
    updateExpirationTime(mutationPayloadHelper(formData));
  }

  return (
    <>
      <div className={cx(styles.form, styles.generalSettings)}>
        <SettingsHeader title="General settings" />
        <FormField
          error={get(errors.sessionLifetimeInDays, 'message')}
          onChange={(value: string) => setValue('sessionLifetimeInDays', value)}
          onBlur={handleSubmit(onSubmit)}
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
