import React, {useState} from 'react';
import useInput from '../../hooks/useInput';

import SettingsHeader from './components/SettingsHeader';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import UserActivityList from '../../components/UserActivityList/UserActivityList';
import * as CHECK from '../../components/Form/check';

import cx from 'classnames';
import styles from './Settings.module.scss';


type FormFieldProps = {
  error: string;
  onChange: Function;
  onSubmit: Function;
};
function FormField({ error, onChange, onSubmit }: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <div className={styles.input}>
        <TextInput
          whiteColor
          showClearButton
          label=""
          error={error}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </div>
      <div className={styles.button}>
        <Button
          label={'SEARCH'}
          onClick={onSubmit}
          border
        />
      </div>
    </div>
  );
}

function isInputInvalid(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldAnString(value)
  ]);
}

function AuditSettings() {
  const [usersFilter, setUsersFilter] = useState('');
  const {
    value,
    onChange,
    error,
  } = useInput('', isInputInvalid);

  function onApplySearch() {
    setUsersFilter(value);
  }

  return (
    <>
      <div className={cx(styles.form, styles.securitySettings)}>
        <SettingsHeader
          title='Audit. User History.'
          subtitle='Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec viverra eleifend
            lacus, vitae ullamcorper metus. Sed sollicitudin ipsum quis nunc sollicitudin ultrices.
            Donec euismod scelerisque ligula. Maecenas eu varius risus, eu aliquet arcu. Curabitur
            fermentum suscipit est, tincidunt.'
        />
        <FormField
          error={error}
          onChange={onChange}
          onSubmit={onApplySearch}
        />
        <div className={styles.domains}>
          <UserActivityList filter={usersFilter} />
        </div>
      </div>
    </>
  );
}

export default AuditSettings;
