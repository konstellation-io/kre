import React, {useState, useEffect} from 'react';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import styles from './Login.module.scss';

function isEmailInvalid(value: string) {
  return (
    CHECK.isFieldEmpty(value) ||
    CHECK.isFieldNotAnString(value) ||
    CHECK.isEmailNotValid(value)
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
        console.log('Login successfully');
        //history.push(PAGES.SHOW_PROJECTS);
      } else {
        console.log('Cannot make login');
      }
    }
  }

  return (
    <div className={ styles.bg }>
      <div className={ styles.grid }>
        <div className={ styles.container }>
          <h1>Please</h1>
          <h1>write your login credentials</h1>
          <p className={ styles.subtitle }>To connect to the cluster</p>
          <div className={ styles.content }>
            <TextInput
              showClearButton
              whiteColor
              label="email"
              error={invalidEmailText}
              onChange={(newValue: string) => setEmailField(newValue)}
              onSummit={onSummit}
            />
            <div className={ styles.buttons }>
              <Button label="SAVE" onClick={onSummit} primary />
              <Button label="FORGOT YOUR PASSWORD?" onClick={onSummit} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
