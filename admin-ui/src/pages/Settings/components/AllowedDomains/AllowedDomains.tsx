import React from 'react';
import * as CHECK from '../../../../components/Form/check';
import { loader } from 'graphql.macro';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { GetDomains } from '../../../../graphql/queries/types/GetDomains';
import {
  UpdateDomains,
  UpdateDomainsVariables
} from '../../../../graphql/mutations/types/UpdateDomains';
import { mutationPayloadHelper } from '../../../../utils/formUtils';
import { get } from 'lodash';
import FormRowInput from '../FormRowInput/FormRowInput';
import DomainIcon from '@material-ui/icons/Language';
import ListItem from '../ListItem/ListItem';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import Message from '../../../../components/Message/Message';

const GetDomainsQuery = loader(
  '../../../../graphql/queries/getDomains.graphql'
);
const UpdateDomainsMutation = loader(
  '../../../../graphql/mutations/updateDomains.graphql'
);

function AllowedDomains() {
  const { data, loading, error } = useQuery<GetDomains>(GetDomainsQuery);
  const domains: string[] = get(data, 'settings.authAllowedDomains', []);

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
    }
  });

  function updateDomains(domains: string[]) {
    updateAllowedDomain(mutationPayloadHelper({ authAllowedDomains: domains }));
  }

  function onSubmitDomain(formData: any) {
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
