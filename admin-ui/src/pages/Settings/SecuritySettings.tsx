import React, { useState, useEffect } from 'react';

import { get } from 'lodash';

import SettingsHeader from './components/SettingsHeader/SettingsHeader';

import cx from 'classnames';
import styles from './Settings.module.scss';

import { loader } from 'graphql.macro';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { GetDomains } from '../../graphql/queries/types/GetDomains';
import {
  UpdateDomains,
  UpdateDomainsVariables
} from '../../graphql/mutations/types/UpdateDomains';
import AdminListForm from './components/AdminList/AdminListForm';
import * as CHECK from '../../components/Form/check';
import { GetAllowedEmails } from '../../graphql/queries/types/GetAllowedEmails';
import {
  UpdateAllowedEmails,
  UpdateAllowedEmailsVariables
} from '../../graphql/mutations/types/UpdateAllowedEmails';
import { mutationPayloadHelper } from '../../utils/formUtils';
import DomainIcon from '@material-ui/icons/Language';
import EmailIcon from '@material-ui/icons/AlternateEmail';

const GetDomainsQuery = loader('../../graphql/queries/getDomains.graphql');
const GetAllowedEmailsQuery = loader(
  '../../graphql/queries/getAllowedEmails.graphql'
);
const UpdateDomainsMutation = loader(
  '../../graphql/mutations/updateDomains.graphql'
);
const UpdateAllowedEmailsMutation = loader(
  '../../graphql/mutations/updateAllowedEmails.graphql'
);

export function validateDomain(value: string, domains: string[]) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isDomainValid(value),
    CHECK.isItemDuplicated(value, domains, 'domain')
  ]);
}

export function validateEmail(value: string, emails: string[]) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isEmailValid(value),
    CHECK.isItemDuplicated(value, emails, 'email')
  ]);
}

function SecuritySettings() {
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);

  const {
    data: domainsData,
    loading: domainsLoading,
    error: domainsError
  } = useQuery<GetDomains>(GetDomainsQuery);

  const {
    data: emailsData,
    loading: emailsLoading,
    error: emailsError
  } = useQuery<GetAllowedEmails>(GetAllowedEmailsQuery);

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

  const [updateAllowedEmails] = useMutation<
    UpdateAllowedEmails,
    UpdateAllowedEmailsVariables
  >(UpdateAllowedEmailsMutation, {
    update: (cache, { data }) => {
      if (data && data.updateSettings) {
        cache.writeQuery({
          query: GetAllowedEmailsQuery,
          data: { settings: data.updateSettings }
        });
      }
    },
    onCompleted: onCompleteUpdateAllowedEmails
  });

  // Set domains data after retrieving it from API
  useEffect(() => {
    const _allowedDomains = get(domainsData, 'settings.authAllowedDomains');
    if (_allowedDomains) {
      setAllowedDomains(_allowedDomains);
    }
  }, [domainsData]);

  useEffect(() => {
    const _allowedEmails = get(emailsData, 'settings.authAllowedEmails');
    if (_allowedEmails) {
      setAllowedEmails(_allowedEmails);
    }
  }, [emailsData]);

  // Set domains data after making a mutation
  function onCompleteUpdateDomain(updatedData: UpdateDomains) {
    setAllowedDomains(updatedData.updateSettings.authAllowedDomains);
  }

  function onCompleteUpdateAllowedEmails(updatedData: UpdateAllowedEmails) {
    setAllowedEmails(updatedData.updateSettings.authAllowedEmails);
  }

  function updateDomains(domains: string[]) {
    updateAllowedDomain(mutationPayloadHelper({ authAllowedDomains: domains }));
    setAllowedDomains(domains);
  }

  function updateEmails(emails: string[]) {
    updateAllowedEmails(mutationPayloadHelper({ authAllowedEmails: emails }));
    setAllowedEmails(emails);
  }

  function onSubmitDomain(formData: any) {
    updateDomains([...allowedDomains, formData.item]);
  }

  function onSubmitEmail(formData: any) {
    updateEmails([...allowedEmails, formData.item]);
  }

  function onRemoveDomain(domain: string) {
    const newDomains = allowedDomains.filter(d => d !== domain);
    updateDomains(newDomains);
  }

  function onRemoveEmail(email: string) {
    const newAllowedEmails = allowedEmails.filter(e => e !== email);
    updateEmails(newAllowedEmails);
  }

  return (
    <>
      <div className={cx(styles.form, styles.securitySettings)}>
        <SettingsHeader title="Security settings" />
        <div className={styles.listsContainer}>
          <AdminListForm
            itemName="domain"
            onSubmit={onSubmitDomain}
            onRemoveItem={onRemoveDomain}
            itemList={allowedDomains}
            error={domainsError && domainsError.message}
            isLoading={domainsLoading}
            onValidate={validateDomain}
            icon={<DomainIcon className="icon-regular" />}
          />
          <AdminListForm
            itemName="email"
            onSubmit={onSubmitEmail}
            onRemoveItem={onRemoveEmail}
            itemList={allowedEmails}
            error={emailsError && emailsError.message}
            isLoading={emailsLoading}
            onValidate={validateEmail}
            icon={<EmailIcon className="icon-regular" />}
          />
        </div>
      </div>
    </>
  );
}

export default SecuritySettings;
