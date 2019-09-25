import React, {useState, useEffect} from 'react';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import styles from './Login.module.scss';

function isEmailInvalid(value: string) {
  return (
    CHECK.isFieldEmpty(value) ||
    CHECK.isFieldNotAnString(value)
  );
}

function Login() {
  const [emailField, setEmailField] = useState('');
  const [invalidEmailText, setInvalidEmailText] = useState('');

  // Resets error warnings after introducing text in an input field
  useEffect(() => setInvalidEmailText(''), [emailField]);

  function onSummit() {
    const emailIsInvalid = isEmailInvalid(emailField);

    setInvalidEmailText(emailIsInvalid || '');

    // If email is valid, make the request
    if (!emailIsInvalid) {
      // TODO: Create login request
      const loginOk = true;

      if (loginOk) {
        alert('Login successfully');
        //history.push(PAGES.SHOW_PROJECTS);
      } else {
        alert('Cannot make login');
      }
    }
  }

  return (
    <div className={ styles.container }>
      <h1>Please write your login credentials</h1>
      <p>To connect to the cluster</p>
      <div>
        <TextInput
          label="Label"
          error={invalidEmailText}
          onChange={(newValue: string) => setEmailField(newValue)}
          onSummit={onSummit}
        />
      </div>
      <Button label="SAVE" onClick={onSummit} primary />
    </div>
  );
}

export default Login;
