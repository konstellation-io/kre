import React, {useState} from 'react';
import useInput from '../../hooks/useInput';
import * as CHECK from '../../components/Form/check';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import UserActivityList from '../../components/UserActivityList/UserActivityList';
import cx from 'classnames';
import styles from './Settings.module.scss';


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
        <div className={styles.formTitle}>Audit. User History.</div>
        <div className={styles.formDescription}>
          Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec viverra eleifend
          lacus, vitae ullamcorper metus. Sed sollicitudin ipsum quis nunc sollicitudin ultrices.
          Donec euismod scelerisque ligula. Maecenas eu varius risus, eu aliquet arcu. Curabitur
          fermentum suscipit est, tincidunt.
        </div>
        <div className={styles.formField}>
          <div className={styles.input}>
            <TextInput
              whiteColor
              showClearButton
              label=""
              error={error}
              onChange={onChange}
              onSubmit={onApplySearch}
            />
          </div>
          <div className={styles.button}>
            <Button
              label={'SEARCH'}
              onClick={onApplySearch}
              border
            />
          </div>
        </div>
        <div className={styles.domains}>
          <UserActivityList filter={usersFilter} />
        </div>
      </div>
    </>
  );
}

export default AuditSettings;
