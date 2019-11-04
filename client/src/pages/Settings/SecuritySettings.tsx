import React from 'react';
import useInput from '../../hooks/useInput';
import * as CHECK from '../../components/Form/check';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import DomainList from '../../components/DomainList/DomainList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {ICON} from '../../icons';
import cx from 'classnames';
import styles from './Settings.module.scss';

function isDomainInvalid(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnString(value),
    CHECK.isDomainValid(value)
  ]);
}

function SecuritySettings() {
  const {
    value,
    isValid,
    onChange,
    error,
  } = useInput('', isDomainInvalid);

  function onSubmit() {
    if(isValid()) {
      // TODO: SEND REQUEST TO ADD A NEW DOMAIN
      console.log(`Domain ${value} added`);
    }
  }

  function onRemoveDomain(domain:string) {
    // TODO: SEND REQUEST TO REMOVE DOMAIN
    console.log(`Domain ${domain} removed`);
  }

  return (
    <>
      <div className={cx(styles.form, styles.securitySettings)}>
        <div className={styles.formTitle}>Security settings</div>
        <div className={styles.formDescription}>
          Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec viverra eleifend
          lacus, vitae ullamcorper metus. Sed sollicitudin ipsum quis nunc sollicitudin ultrices.
          Donec euismod scelerisque ligula. Maecenas eu varius risus, eu aliquet arcu. Curabitur
          fermentum suscipit est, tincidunt.
        </div>
        <div className={styles.formField}>
          <FontAwesomeIcon icon={ICON.SECURITY} />
          <p className={styles.label}>Domain white list</p>
          <div className={styles.input}>
            <TextInput
              whiteColor
              label="domain name"
              error={error}
              onChange={onChange}
              onSubmit={onSubmit}
            />
          </div>
          <div className={styles.button}>
            <Button
              label={'ADD DOMAIN'}
              onClick={onSubmit}
              border
            />
          </div>
        </div>
        <div className={styles.domains}>
          <DomainList onRemoveDomain={onRemoveDomain}/>
        </div>
      </div>
    </>
  );
}

export default SecuritySettings;
