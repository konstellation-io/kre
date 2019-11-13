import React, { useState, useEffect } from 'react';
import useInput from '../../hooks/useInput';

import DomainIcon from '@material-ui/icons/Language';

import SettingsHeader from './components/SettingsHeader';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import DomainList from '../../components/DomainList/DomainList';
import * as CHECK from '../../components/Form/check';

import cx from 'classnames';
import styles from './Settings.module.scss';

import { useQuery, useMutation } from '@apollo/react-hooks';
import {
  GET_DOMAINS,
  ADD_ALLOWED_DOMAIN,
  REMOVE_ALLOWED_DOMAIN
} from './dataModels';

type FormFieldProps = {
  error: string;
  onChange: Function;
  onSubmit: Function;
};
function FormField({ error, onChange, onSubmit }: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <DomainIcon style={{ fontSize: '1rem' }} />
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
        <Button label={'ADD DOMAIN'} onClick={onSubmit} border />
      </div>
    </div>
  );
}

function isDomainInvalid(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnString(value),
    CHECK.isDomainValid(value)
  ]);
}

function SecuritySettings() {
  const [allowedDomains, setAllowedDomains] = useState([]);
  const { value, isValid, onChange, error: inputError } = useInput(
    '',
    isDomainInvalid
  );
  const { data: queryData, loading, error: queryError } = useQuery(GET_DOMAINS);
  const [addAllowedDomain] = useMutation(ADD_ALLOWED_DOMAIN, {
    onCompleted: onCompleteAddDomain
  });
  const [removeAllowedDomain] = useMutation(REMOVE_ALLOWED_DOMAIN, {
    onCompleted: onCompleteRemoveDomain
  });

  // Set domains data after retrieving it from API
  useEffect(() => {
    if (queryData) {
      setAllowedDomains(queryData.settings.authAllowedDomains);
    }
  }, [queryData]);
  // Set domains data after making a mutation
  function onCompleteAddDomain(updatedData: any) {
    setAllowedDomains(updatedData.addAllowedDomain.authAllowedDomains);
  }
  function onCompleteRemoveDomain(updatedData: any) {
    setAllowedDomains(updatedData.removeAllowedDomain.authAllowedDomains);
  }

  function onSubmit() {
    if (isValid()) {
      console.log(`Domain ${value} added`);
      addAllowedDomain({ variables: { domainName: value } });
    }
  }

  function onRemoveDomain(domain: string) {
    console.log(`Domain ${domain} removed`);
    removeAllowedDomain({ variables: { domainName: value } });
  }

  function getContent() {
    if (queryError) return <p>ERROR</p>;
    if (loading) return <Spinner />;

    return <DomainList onRemoveDomain={onRemoveDomain} data={allowedDomains} />;
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
        <FormField error={inputError} onChange={onChange} onSubmit={onSubmit} />
        <div className={styles.domains}>{getContent()}</div>
      </div>
    </>
  );
}

export default SecuritySettings;
