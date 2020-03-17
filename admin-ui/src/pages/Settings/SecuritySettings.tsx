import React, { useState, useEffect, MouseEvent } from 'react';

import { useForm } from 'react-hook-form';
import { get } from 'lodash';
import DomainIcon from '@material-ui/icons/Language';

import SettingsHeader from './components/SettingsHeader';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import DomainList from '../../components/DomainList/DomainList';
import * as CHECK from '../../components/Form/check';

import cx from 'classnames';
import styles from './Settings.module.scss';

import { loader } from 'graphql.macro';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { GetDomains } from '../../graphql/queries/types/GetDomains';
import {
  UpdateDomains,
  UpdateDomainsVariables
} from '../../graphql/mutations/types/UpdateDomains';

const GetDomainsQuery = loader('../../graphql/queries/getDomains.graphql');
const UpdateDomainsMutation = loader(
  '../../graphql/mutations/updateDomains.graphql'
);

type FormFieldProps = {
  value?: string;
  error: string;
  onChange: Function;
  onSubmit: (e: MouseEvent<HTMLDivElement>) => void;
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
          onEnterKeyPress={onSubmit}
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
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);

  const { data: queryData, loading, error: queryError } = useQuery<GetDomains>(
    GetDomainsQuery
  );
  const [updateAllowedDomain] = useMutation<
    UpdateDomains,
    UpdateDomainsVariables
  >(UpdateDomainsMutation, {
    update: (cache, { data }) => {
      if (data && data.updateSettings) {
        cache.writeQuery({
          query: GetDomainsQuery,
          data: { settings: data.updateSettings }
        });
      }
    },
    onCompleted: onCompleteUpdateDomain
  });

  const {
    handleSubmit,
    setValue,
    register,
    errors,
    watch,
    clearError
  } = useForm();

  // Set domains data after retrieving it from API
  useEffect(() => {
    const _allowedDomains = get(queryData, 'settings.authAllowedDomains');
    if (_allowedDomains) {
      setAllowedDomains(_allowedDomains);
      register('domain', {
        validate: value => validateForm(value, _allowedDomains)
      });
      setValue('domain', '');
    }
  }, [queryData, register, setValue]);

  // Set domains data after making a mutation
  function onCompleteUpdateDomain(updatedData: UpdateDomains) {
    setAllowedDomains(updatedData.updateSettings.authAllowedDomains);
  }

  function updateDomains(newDomains: string[]) {
    const input = { authAllowedDomains: newDomains };
    updateAllowedDomain({ variables: { input } });
    setAllowedDomains(newDomains);

    setValue('domain', '');
  }

  function onSubmit(formData: any) {
    updateDomains([...allowedDomains, formData.domain]);
    setValue('domain', '');
  }

  function onRemoveDomain(domain: string) {
    console.log(`Domain ${domain} removed`, allowedDomains, domain);
    const newDomains = allowedDomains.filter(d => d !== domain);
    updateDomains(newDomains);
    clearError('domain');
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
        <SettingsHeader title="Security settings" />
        <FormField
          error={get(errors.domain, 'message')}
          onChange={(value: string) => setValue('domain', value)}
          onSubmit={handleSubmit(onSubmit)}
          value={watch('domain', '')}
        />
        <div className={styles.domains}>{getContent()}</div>
      </div>
    </>
  );
}

export default SecuritySettings;
