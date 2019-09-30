import React from 'react';
import useInput from '../../hooks/useInput';
import useEndpoint from '../../hooks/useEndpoint';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import { ENDPOINT } from '../../constants/application';
import styles from './Login.module.scss';

function isEmailInvalid(value: string) {
  return (
    CHECK.isFieldEmpty(value) ||
    CHECK.isFieldNotAnString(value) ||
    CHECK.isEmailNotValid(value)
  );
}

function Login() {
  const {
    value,
    isValid,
    onChange,
    error
  } = useInput('', isEmailInvalid);
  
  const [response, makeRequest] = useEndpoint({
    endpoint: ENDPOINT.SUBMIT_MAGIC_LINK,
    method: 'POST'
  });

  function onSubmit() {
    if(isValid()) {
      console.log('Request sent');
      makeRequest({ email: value });
    }
  }

  if (response.pending) {
    // TODO: Show loader
    // history.push(PAGES.SHOW_PR  OJECTS);
  }
  if (response.error) {
    // TODO: Show error message
  }
  if (response.complete && !response.error) {
    // TODO: Request success
  }

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
                label="Send me a login link"
                onClick={onSubmit}
                primary
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
