import * as CHECK from 'Components/Form/check';

import {
  CreateRuntime,
  CreateRuntimeVariables
} from 'Graphql/mutations/types/CreateRuntime';
import { FieldError, useForm } from 'react-hook-form';
import {
  GetRuntimes,
  GetRuntimes_runtimes
} from 'Graphql/queries/types/GetRuntimes';
import React, { useEffect } from 'react';

import Button from 'Components/Button/Button';
import ROUTE from 'Constants/routes';
import TextInput from 'Components/Form/TextInput/TextInput';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';
import styles from './AddRuntime.module.scss';
import { useHistory } from 'react-router';
import { useMutation } from '@apollo/react-hooks';

const GetRuntimesQuery = loader('../../Graphql/queries/getRuntimes.graphql');
const CreateRuntimeMutation = loader(
  '../../Graphql/mutations/createRuntime.graphql'
);

const MAX_LENGTH = 20;

function verifyRuntimeName(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isLengthAllowed(value, MAX_LENGTH)
  ]);
}

function getErrorText(errorType: FieldError | undefined) {
  if (!errorType) return '';

  switch (errorType.type) {
    case 'required':
      return 'This field cannot be empty';
  }
}

function AddRuntime() {
  const history = useHistory();

  const {
    handleSubmit,
    setValue,
    register,
    errors,
    setError,
    watch
  } = useForm();
  useEffect(() => {
    register('name', { validate: verifyRuntimeName });
    register('description', { required: true });
    setValue('name', '');
  }, [register, setValue]);

  const [addRuntime, { loading, error: mutationError }] = useMutation<
    CreateRuntime,
    CreateRuntimeVariables
  >(CreateRuntimeMutation, {
    onCompleted: onCompleteAddRuntime,
    onError: () => console.error('Runtime could not be created'),
    update(cache, updateResult) {
      if (updateResult.data !== undefined && updateResult.data !== null) {
        const newRuntime = updateResult.data
          .createRuntime as GetRuntimes_runtimes;
        const cacheResult = cache.readQuery<GetRuntimes>({
          query: GetRuntimesQuery
        });

        if (cacheResult !== null) {
          const { runtimes } = cacheResult;
          cache.writeQuery({
            query: GetRuntimesQuery,
            data: { runtimes: runtimes.concat([newRuntime]) }
          });
        }
      }
    }
  });

  useEffect(() => {
    if (mutationError) {
      setError('name', '', mutationError.toString());
    }
  }, [mutationError, setError]);

  function onCompleteAddRuntime(updatedData: CreateRuntime) {
    history.push(ROUTE.HOME);
  }

  function onSubmit(formData: any) {
    addRuntime(mutationPayloadHelper(formData));
  }

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Add Runtime</h1>
          <p className={styles.subtitle} />
          <div className={styles.content}>
            <TextInput
              whiteColor
              label="runtime name"
              error={get(errors.name, 'message')}
              onChange={(value: string) => setValue('name', value)}
              onEnterKeyPress={handleSubmit(onSubmit)}
              helpText={`${watch('name', '').length}/${MAX_LENGTH}`}
              maxLength={MAX_LENGTH}
              autoFocus
            />
            <TextInput
              textArea
              whiteColor
              lockHorizontalGrowth
              limits={{
                minHeight: 90,
                maxHeight: 360
              }}
              label="runtime description"
              error={getErrorText(errors.description as FieldError)}
              onChange={(value: string) => setValue('description', value)}
            />
            <div className={styles.buttons}>
              <Button
                primary
                label="SAVE"
                onClick={handleSubmit(onSubmit)}
                loading={loading}
                className={styles.buttonSave}
                tabIndex={0}
              />
              <Button
                label="CANCEL"
                onClick={() => {
                  history.goBack();
                }}
                tabIndex={0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRuntime;
