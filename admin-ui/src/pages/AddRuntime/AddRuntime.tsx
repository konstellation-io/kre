import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import { get } from 'lodash';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import styles from './AddRuntime.module.scss';
import { loader } from 'graphql.macro';
import { useMutation } from '@apollo/react-hooks';
import {
  GetRuntimes,
  GetRuntimes_runtimes
} from '../../graphql/queries/types/GetRuntimes';
import {
  CreateRuntime,
  CreateRuntimeVariables
} from '../../graphql/mutations/types/CreateRuntime';
import ROUTE from '../../constants/routes';
import { useForm, FieldError } from 'react-hook-form';
import { mutationPayloadHelper } from '../../utils/formUtils';

const GetRuntimesQuery = loader('../../graphql/queries/getRuntimes.graphql');
const CreateRuntimeMutation = loader(
  '../../graphql/mutations/createRuntime.graphql'
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
              />
              <Button
                label="CANCEL"
                onClick={() => {
                  history.goBack();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRuntime;
