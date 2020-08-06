import { CHECK, ErrorMessage, SpinnerCircular } from 'kwc';
import FormRowInput, { FormData } from '../FormRowInput/FormRowInput';
import {
  UpdateDomains,
  UpdateDomainsVariables
} from 'Graphql/mutations/types/UpdateDomains';
import { useMutation, useQuery } from '@apollo/client';

import DomainIcon from '@material-ui/icons/Language';
import { GetDomains } from 'Graphql/queries/types/GetDomains';
import ListItem from '../ListItem/ListItem';
import Message from 'Components/Message/Message';
import React from 'react';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';

const GetDomainsQuery = loader('Graphql/queries/getDomains.graphql');
const UpdateDomainsMutation = loader('Graphql/mutations/updateDomains.graphql');

function AllowedDomains() {
  const { data, loading, error } = useQuery<GetDomains>(GetDomainsQuery);
  const domains: string[] = get(data, 'settings.authAllowedDomains', []);

  const [updateAllowedDomain] = useMutation<
    UpdateDomains,
    UpdateDomainsVariables
  >(UpdateDomainsMutation, {
    onError: e => console.error(`updateAllowedDomain: ${e}`),
    update: (cache, { data }) => {
      if (data && data.updateSettings) {
        cache.writeQuery({
          query: GetDomainsQuery,
          data: { settings: data.updateSettings }
        });
      }
    }
  });

  function updateDomains(domains: string[]) {
    updateAllowedDomain(mutationPayloadHelper({ authAllowedDomains: domains }));
  }

  function onSubmitDomain(formData: FormData) {
    updateDomains([...domains, formData.item]);
  }

  function onRemoveDomain(domain: string) {
    const newDomains = domains.filter(d => d !== domain);
    updateDomains(newDomains);
  }

  function validateDomain(value: string) {
    return CHECK.getValidationError([
      CHECK.isFieldNotEmpty(value),
      CHECK.isDomainValid(value),
      CHECK.isItemDuplicated(value, domains, 'domain')
    ]);
  }

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (error) return <ErrorMessage />;
    if (!domains.length)
      return <Message text="There are no domains added to the whitelist." />;

    return domains.map((domain: string) => (
      <ListItem key={domain} value={domain} onDelete={onRemoveDomain} />
    ));
  }

  return (
    <div>
      <FormRowInput
        Icon={DomainIcon}
        field="Domain white list"
        inputLabel="domain name"
        buttonLabel="ADD DOMAIN"
        valueValidator={validateDomain}
        onAction={onSubmitDomain}
      />
      {getContent()}
    </div>
  );
}

export default AllowedDomains;
