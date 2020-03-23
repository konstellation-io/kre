import { get } from 'lodash';

import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import useEndpoint from '../../hooks/useEndpoint';

import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import ROUTE from '../../constants/routes';
import { ENDPOINT } from '../../constants/application';

import styles from './Login.module.scss';
import { useForm } from 'react-hook-form';

export function verifyEmail(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isEmailValid(value)
  ]);
}

function Login() {
  const history = useHistory();
  const { handleSubmit, setValue, register, errors, setError } = useForm();
  const [response, makeRequest] = useEndpoint({
    endpoint: ENDPOINT.SUBMIT_MAGIC_LINK,
    method: 'POST'
  });

  function onSubmit(data: object) {
    makeRequest(data);
  }
  useEffect(() => {
    register('email', {
      validate: verifyEmail
    });
    setValue('email', '');
  }, [register, setValue]);

  useEffect(
    function() {
      if (response.complete) {
        if (get(response, 'status') === 200) {
          history.push(ROUTE.VERIFY_EMAIL);
        } else if (
          get(response, 'error') &&
          get(response, 'data.code') === 'validation_error'
        ) {
          setError('email', '', 'Invalid email');
        } else if (get(response, 'data.code') === 'user_not_allowed') {
          setError('email', '', 'User not allowed');
        } else {
          setError(
            'email',
            '',
            'Unexpected error. Contact support for more information'
          );
        }
      }
    },
    [response, history, setError]
  );
  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Please</h1>
          <h1>enter your email address</h1>
          <div className={styles.content}>
            <TextInput
              whiteColor
              label="email"
              error={get(errors.email, 'message')}
              onChange={(value: string) => setValue('email', value)}
              onEnterKeyPress={handleSubmit(onSubmit)}
              showClearButton
            />
            <div className={styles.buttons}>
              <Button
                primary
                label="SEND ME A LOGIN LINK"
                onClick={handleSubmit(onSubmit)}
                loading={response.pending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
