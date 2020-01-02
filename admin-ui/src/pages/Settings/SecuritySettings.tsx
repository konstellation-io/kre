import { get } from 'lodash';

import React, { useState, useEffect } from 'react';
import useInput from '../../hooks/useInput';

import DomainIcon from '@material-ui/icons/Language';

import SettingsHeader from './components/SettingsHeader';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import DomainList from '../../components/DomainList/DomainList';
import * as CHECK from '../../components/Form/check';

import cx from 'classnames';
import styles from './Settings.module.scss';

import { useMutation, useQuery } from '@apollo/react-hooks';
import {
  GET_DOMAINS,
  UPDATE_DOMAINS,
  SettingsResponse,
  SettingsVars
} from './Settings.graphql';

type FormFieldProps = {
  value?: string;
  error: string;
  onChange: Function;
  onSubmit: Function;
};

function FormField({ value, error, onChange, onSubmit }: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <DomainIcon className="icon-regular" />
      <p className={styles.label}>Domain white list</p>
      <div className={styles.input}>
        <TextInput
          whiteColor
          label="domain name"
          error={error}
          onChange={onChange}
          onSubmit={onSubmit}
          formValue={value}
        />
      </div>
      <div className={styles.button}>
        <Button label={'ADD DOMAIN'} onClick={onSubmit} border />
      </div>
    </div>
  );
}

function validateForm(value: string, domains: string[]) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnString(value),
    CHECK.isDomainValid(value),
    domainDuplicated(value, domains)
  ]);
}

function domainDuplicated(newDomain: string, domains: string[]) {
  const valid = !domains.includes(newDomain);
  const msg = valid ? '' : 'Duplicated domain';
  return { valid, message: msg };
}

function SecuritySettings() {
  const [allowedDomains, setAllowedDomains] = useState([]);

  const { data: queryData, loading, error: queryError } = useQuery<
    SettingsResponse
  >(GET_DOMAINS, { fetchPolicy: 'no-cache' });
  const [updateAllowedDomain] = useMutation<SettingsResponse, SettingsVars>(
    UPDATE_DOMAINS,
    { onCompleted: onCompleteUpdateDomain }
  );
  const {
    value,
    isValid,
    onChange,
    error: inputError,
    clear,
    clearError
  } = useInput('', (val: string) => validateForm(val, allowedDomains));

  // Set domains data after retrieving it from API
  useEffect(() => {
    if (get(queryData, 'settings')) {
      setAllowedDomains(get(queryData, 'settings.authAllowedDomains'));
    }
  }, [queryData]);
  // Set domains data after making a mutation
  function onCompleteUpdateDomain(updatedData: any) {
    setAllowedDomains(updatedData.updateSettings.settings.authAllowedDomains);
  }

  function updateDomains(newDomains: any) {
    const input = { authAllowedDomains: newDomains };
    updateAllowedDomain({ variables: { input } });
    setAllowedDomains(newDomains);

    clear();
  }

  function onSubmit() {
    if (isValid()) {
      const domain = value.toLowerCase();
      console.log(`Domain ${domain} added`);

      const newDomains = allowedDomains.concat(domain);
      updateDomains(newDomains);
      clear();
      clearError();
    }
  }

  function onRemoveDomain(domain: string) {
    console.log(`Domain ${domain} removed`, allowedDomains, domain);
    const newDomains = allowedDomains.filter(d => d !== domain);
    updateDomains(newDomains);
    clearError();
  }

  function getContent() {
    return (
      <DomainList
        onRemoveDomain={onRemoveDomain}
        error={queryError}
        loading={loading}
        data={allowedDomains}
      />
    );
  }

  return (
    <>
      <div className={cx(styles.form, styles.securitySettings)}>
        <SettingsHeader
          title="Security settings"
          subtitle="Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec viverra eleifend
            lacus, vitae ullamcorper metus. Sed sollicitudin ipsum quis nunc sollicitudin ultrices.
            Donec euismod scelerisque ligula. Maecenas eu varius risus, eu aliquet arcu. Curabitur
            fermentum suscipit est, tincidunt."
        />
        <FormField
          error={inputError}
          onChange={onChange}
          onSubmit={onSubmit}
          value={value}
        />
        <div className={styles.domains}>{getContent()}</div>
      </div>
    </>
  );
}

export default SecuritySettings;
