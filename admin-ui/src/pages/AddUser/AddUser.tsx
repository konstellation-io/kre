import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import { get } from 'lodash';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import styles from './AddUser.module.scss';
import { loader } from 'graphql.macro';
import { useMutation } from '@apollo/react-hooks';
import {
  CreateUser,
  CreateUserVariables
} from '../../graphql/mutations/types/CreateUser';
import ROUTE from '../../constants/routes';
import { useForm } from 'react-hook-form';
import { mutationPayloadHelper } from '../../utils/formUtils';
import { AccessLevel } from '../../graphql/types/globalTypes';
import Select from '../../components/Form/Select/Select';

const CreateUserMutation = loader('../../graphql/mutations/createUser.graphql');

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
  useEffect(() => {
    register('email', { validate: verifyEmail });
    register('accessLevel', { required: true, validate: verifyAccessLevel });
    setValue('email', '');
    setValue('accessLevel', AccessLevel.VIEWER);
  }, [register, setValue]);

  const [addUser, { loading, error: mutationError }] = useMutation<
    CreateUser,
    CreateUserVariables
  >(CreateUserMutation, {
    onCompleted: onCompleteAddUser
  });

  useEffect(() => {
    if (mutationError) {
      setError('email', '', mutationError.toString());
    }
  }, [mutationError, setError]);

  function onCompleteAddUser(updatedData: CreateUser) {
    // TODO: CHECK FOR API ERRORS
    history.push(ROUTE.SETTINGS_USERS);
  }

  function onSubmit(formData: FormData) {
    console.log('AAAA');

    addUser(mutationPayloadHelper(formData));
  }

  console.log('errors');

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
              error={get(errors.email, 'message')}
              onChange={(value: string) => setValue('email', value)}
              onEnterKeyPress={handleSubmit(onSubmit)}
              autoFocus
            />
            <Select
              label="User type"
              showSelectAllOption={false}
              options={Object.values(AccessLevel)}
              onChange={(value: AccessLevel) => setValue('accessLevel', value)}
              error={get(errors.accessLevel, 'message')}
              formSelectedOption={watch('accessLevel')}
              placeholder="Access level"
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

export default AddUser;
