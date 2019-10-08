import React, { useEffect } from 'react';
import useInput from '../../hooks/useInput';
import useEndpoint from '../../hooks/useEndpoint';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import * as PAGES from '../../constants/routes';
import { ENDPOINT } from '../../constants/application';
import styles from './Login.module.scss';

function isEmailInvalid(value: string) {
  return (
    CHECK.isFieldEmpty(value) ||
    CHECK.isFieldNotAnString(value) ||
    CHECK.isEmailNotValid(value)
  );
}

type Props = {
  history: any;
};

function Login({ history }: Props) {
  const {
    value,
    isValid,
    onChange,
    error,
    setError
  } = useInput('', isEmailInvalid);
  const [response, makeRequest] = useEndpoint({
    endpoint: ENDPOINT.SUBMIT_MAGIC_LINK,
    method: 'POST'
  });

  function onSubmit() {
    if(isValid()) {
      makeRequest({ email: value });
    }
  }

  useEffect(function() {
    if (response.complete) {
      if (response.data === 'OK') {
        history.push(PAGES.VERIFY_EMAIL);
      } else {
        setError('Unexpected error. Contact support for more information');
      }
    }
  }, [response, history, setError]);

  return (
    <div className={ styles.bg }>
      <div className={ styles.grid }>
        <div className={ styles.container }>
          <h1>Please</h1>
          <h1>enter your email address</h1>
          <div className={ styles.content }>
            <TextInput
              showClearButton
              whiteColor
              label="email"
              error={error}
              onChange={onChange}
              onSubmit={onSubmit}
            />
            <div className={ styles.buttons }>
              <Button
                primary
                label="Send me a login link"
                onClick={onSubmit}
                loading={ response.pending }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
