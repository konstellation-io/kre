import * as CHECK from 'Components/Form/check';

import React, { useEffect, useState } from 'react';
import TextInput, { InputType } from 'Components/Form/TextInput/TextInput';
import {
  UpdateSettings,
  UpdateSettingsVariables
} from 'Graphql/mutations/types/UpdateSettings';
import { useMutation, useQuery } from '@apollo/react-hooks';

import Button from 'Components/Button/Button';
import ErrorMessage from 'Components/ErrorMessage/ErrorMessage';
import { GetSettings } from 'Graphql/queries/types/GetSettings';
import HorizontalBar from 'Components/Layout/HorizontalBar/HorizontalBar';
import ModalContainer from 'Components/Layout/ModalContainer/ModalContainer';
import ModalLayoutInfo from 'Components/Layout/ModalContainer/layouts/ModalLayoutInfo/ModalLayoutInfo';
import SettingsHeader from './components/SettingsHeader/SettingsHeader';
import SpinnerCircular from 'Components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import cx from 'classnames';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';
import styles from './Settings.module.scss';
import { useForm } from 'react-hook-form';

const GetExpirationTimeQuery = loader(
  '../../Graphql/queries/getExpirationTime.graphql'
);
const updateSessionLifetimeMutation = loader(
  '../../Graphql/mutations/updateSettings.graphql'
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
        <SettingsHeader>General settings</SettingsHeader>
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
        <ModalContainer
          title="Configuration will be updated"
          actionButtonLabel="CONTINUE"
          onAccept={handleSubmit(onSubmit)}
          onCancel={closeModal}
          autofocusOnAccept
          blocking
        >
          <ModalLayoutInfo>
            After updating this configuration, the expiration time of all new
            sessions will be updated, are you sure you want to continue?
          </ModalLayoutInfo>
        </ModalContainer>
      )}
    </>
  );
}

export default GeneralSettings;
