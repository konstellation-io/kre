import * as CHECK from 'Components/Form/check';

import {
  CreateUser,
  CreateUserVariables,
  CreateUser_createUser
} from 'Graphql/mutations/types/CreateUser';
import React, { useEffect } from 'react';

import { AccessLevel } from 'Graphql/types/globalTypes';
import Button from 'Components/Button/Button';
import { GetUsers } from 'Graphql/queries/types/GetUsers';
import ROUTE from 'Constants/routes';
import Select from 'Components/Form/Select/Select';
import TextInput from 'Components/Form/TextInput/TextInput';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';
import styles from './AddUser.module.scss';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { useMutation } from '@apollo/react-hooks';

const GetUsersQuery = loader('../../Graphql/queries/getUsers.graphql');
const CreateUserMutation = loader('../../Graphql/mutations/createUser.graphql');

function verifyEmail(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isEmailValid(value)
  ]);
}

function verifyAccessLevel(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldNotInList(value, Object.values(AccessLevel))
  ]);
}

type FormData = {
  email: string;
  accessLevel: AccessLevel;
};

function AddUser() {
  const history = useHistory();

  const { handleSubmit, setValue, register, errors, setError, watch } = useForm<
    FormData
  >();
  const [addUser, { loading, error: mutationError }] = useMutation<
    CreateUser,
    CreateUserVariables
  >(CreateUserMutation, {
    onCompleted: onCompleteAddUser,
    onError: () => console.error('User could not be created'),
    update: (cache, { data }) => {
      const newUser = data?.createUser as CreateUser_createUser;
      const cacheResult = cache.readQuery<GetUsers>({
        query: GetUsersQuery
      });

      if (cacheResult !== null) {
        const { users } = cacheResult;
        cache.writeQuery({
          query: GetUsersQuery,
          data: { users: users.concat([newUser]) }
        });
      }
    }
  });

  useEffect(() => {
    register('email', { validate: verifyEmail });
    register('accessLevel', { required: true, validate: verifyAccessLevel });
    setValue('email', '');
    setValue('accessLevel', AccessLevel.VIEWER);
  }, [register, setValue]);

  useEffect(() => {
    if (mutationError) {
      setError('email', '', mutationError.toString());
    }
  }, [mutationError, setError]);

  function onCompleteAddUser(updatedData: CreateUser) {
    history.push(ROUTE.SETTINGS_USERS);
  }

  function onSubmit(formData: FormData) {
    addUser(mutationPayloadHelper(formData));
  }

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Please introduce a new user</h1>
          <p className={styles.subtitle} />
          <div className={styles.content}>
            <TextInput
              whiteColor
              label="email"
              error={get(errors.email, 'message') as string}
              onChange={(value: string) => setValue('email', value)}
              onEnterKeyPress={handleSubmit(onSubmit)}
              autoFocus
            />
            <Select
              label="User type"
              showSelectAllOption={false}
              options={Object.values(AccessLevel)}
              onChange={(value: AccessLevel) => setValue('accessLevel', value)}
              error={get(errors.accessLevel, 'message') as string}
              formSelectedOption={watch('accessLevel')}
              placeholder="Access level"
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

export default AddUser;
