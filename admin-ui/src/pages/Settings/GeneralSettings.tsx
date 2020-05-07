import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { get } from 'lodash';

import SettingsHeader from './components/SettingsHeader/SettingsHeader';
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
import HorizontalBar from '../../components/Layout/HorizontalBar/HorizontalBar';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';

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
  formValue: string | number | undefined;
  prevValue: number | undefined;
  onSubmit: Function;
};
function FormField({
  error,
  onChange,
  formValue,
  prevValue,
  onSubmit
}: FormFieldProps) {
  const showPrevValue =
    prevValue && formValue && prevValue.toString() !== formValue.toString();
  return (
    <div className={styles.formField}>
      <p className={styles.label}>Session expiration time in days</p>
      <div className={styles.input}>
        <TextInput
          whiteColor
          type={InputType.NUMBER}
          additionalInputProps={{ min: 0 }}
          label="days"
          error={error}
          onChange={onChange}
          onEnterKeyPress={onSubmit}
          formValue={formValue}
          infoMessage={showPrevValue ? prevValue?.toString() : ''}
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
  const [prevValue, setPrevValue] = useState<number | undefined>();
  const [showModal, setShowModal] = useState<boolean>(false);
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
  const { handleSubmit, setValue, register, errors, watch } = useForm();
  useEffect(() => {
    register('sessionLifetimeInDays', { validate: isExpirationInvalid });
    setValue('sessionLifetimeInDays', '');
  }, [register, setValue]);

  // Sets domains data after receiving API response
  useEffect(() => {
    if (data) {
      const value = data.settings.sessionLifetimeInDays;
      setValue('sessionLifetimeInDays', value);
      setPrevValue(value);
    }
  }, [data, setValue]);

  if (loading) return <SpinnerCircular />;
  if (queryError) return <ErrorMessage />;

  function onSubmit(formData: any) {
    updateExpirationTime(mutationPayloadHelper(formData));
    setPrevValue(formData.sessionLifetimeInDays);
    setShowModal(false);
  }
  const fieldEmpty = watch('sessionLifetimeInDays') === '';

  function onEnterKey() {
    if (!fieldEmpty) openModal();
  }

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <>
      <div className={cx(styles.form, styles.generalSettings)}>
        <SettingsHeader title="General settings" />
        <FormField
          error={get(errors.sessionLifetimeInDays, 'message')}
          onChange={(value: string) => setValue('sessionLifetimeInDays', value)}
          formValue={watch('sessionLifetimeInDays')}
          prevValue={prevValue}
          onSubmit={onEnterKey}
        />
      </div>
      <HorizontalBar>
        <Button
          label={'SAVE CHANGES'}
          primary
          onClick={openModal}
          disabled={fieldEmpty}
        />
      </HorizontalBar>

      {showModal && (
        <Modal
          title="Configuration will be updated"
          message="After updating this configuration, the expiration time of all new sessions will be updated, are you sure you want to continue?"
          actionButtonLabel="CONTINUE"
          onAccept={handleSubmit(onSubmit)}
          onClose={closeModal}
        />
      )}
    </>
  );
}

export default GeneralSettings;
