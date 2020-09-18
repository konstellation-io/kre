import { Button, CHECK, TextInput } from 'kwc';
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

import ROUTE from 'Constants/routes';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';
import styles from './AddRuntime.module.scss';
import { unregisterMany } from 'Utils/react-forms';
import { useHistory } from 'react-router';
import { useMutation } from '@apollo/client';

const GetRuntimesQuery = loader('Graphql/queries/getRuntimes.graphql');
const CreateRuntimeMutation = loader('Graphql/mutations/createRuntime.graphql');

const ID_MAX_LENGTH = 15;
const NAME_MAX_LENGTH = 40;
const DES_MAX_LENGTH = 500;
const INVALID_ID_CHARS_REGEXP = /[^a-z0-9-]/g;
const SPACES_REGEXP = / +/g;

function verifyRuntimeName(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isLengthAllowed(value, NAME_MAX_LENGTH)
  ]);
}

function validateRuntimeID(value: string): string | boolean {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isLengthAllowed(value, ID_MAX_LENGTH),
    CHECK.isLowerCase(value),
    CHECK.matches(value, /^[a-z]/, 'ID must start with a lowercase letter'),
    CHECK.matches(value, /.{3,}/, 'ID must contain at least 3 chars'),
    CHECK.isAlphanumeric(
      value.replaceAll('-', ''),
      'ID only can contain lowercase alphanumeric and hyphens'
    ),
    CHECK.isSlug(value)
  ]);
}

function getErrorText(errorType: FieldError | undefined) {
  if (!errorType) return '';

  switch (errorType.type) {
    case 'required':
      return 'This field cannot be empty';
  }
}

type FormData = {
  name: string;
  id: string;
  description: string;
};

function AddRuntime() {
  const history = useHistory();

  const {
    handleSubmit,
    setValue,
    register,
    unregister,
    errors,
    watch
  } = useForm<FormData>({
    defaultValues: {
      name: ''
    }
  });
  useEffect(() => {
    register('name', { validate: verifyRuntimeName });
    register('id', { validate: validateRuntimeID });
    register('description', { required: true });

    return () => unregisterMany(unregister, ['name', 'description']);
  }, [register, unregister, setValue]);

  const [addRuntime, { loading }] = useMutation<
    CreateRuntime,
    CreateRuntimeVariables
  >(CreateRuntimeMutation, {
    onCompleted: onCompleteAddRuntime,
    onError: e => {
      console.error(`addRuntime: ${e}`);
    },
    update(cache, updateResult) {
      if (updateResult.data) {
        const newRuntime = updateResult.data
          .createRuntime as GetRuntimes_runtimes;

        try {
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
          // readQuery throws an error when the query fails, we need to wrap it in a try/catch block to silent it.
          // https://github.com/apollographql/apollo-client/issues/1542
        } catch (e) {} // eslint-disable-line
      }
    }
  });

  function onCompleteAddRuntime(updatedData: CreateRuntime) {
    history.push(ROUTE.HOME);
  }

  function onSubmit(formData: any) {
    addRuntime(mutationPayloadHelper(formData));
  }

  function generateID(name: string) {
    const id = name
      .trim()
      .toLowerCase()
      .replaceAll(SPACES_REGEXP, '-')
      .replaceAll(INVALID_ID_CHARS_REGEXP, '')
      .substr(0, ID_MAX_LENGTH);

    setValue('id', id);
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
              label="name"
              error={get(errors.name, 'message') as string}
              onChange={(value: string) => {
                setValue('name', value);
                generateID(value);
              }}
              onEnterKeyPress={handleSubmit(onSubmit)}
              helpText={`${watch('name', '').length}/${NAME_MAX_LENGTH}`}
              maxLength={NAME_MAX_LENGTH}
              autoFocus
            />
            <TextInput
              whiteColor
              formValue={watch('id')}
              label="ID"
              error={get(errors.id, 'message') as string}
              onChange={(value: string) => setValue('id', value)}
              onEnterKeyPress={handleSubmit(onSubmit)}
              helpText={`${watch('id', '').length}/${ID_MAX_LENGTH}`}
              maxLength={ID_MAX_LENGTH}
            />
            <TextInput
              textArea
              whiteColor
              lockHorizontalGrowth
              onEnterKeyPress={handleSubmit(onSubmit)}
              limits={{
                minHeight: 90,
                maxHeight: 360
              }}
              label="description"
              error={getErrorText(errors.description as FieldError)}
              onChange={(value: string) => setValue('description', value)}
              helpText={`${watch('description', '').length}/${DES_MAX_LENGTH}`}
              maxLength={DES_MAX_LENGTH}
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
