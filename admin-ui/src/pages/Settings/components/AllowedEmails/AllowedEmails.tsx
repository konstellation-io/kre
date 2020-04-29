import React from 'react';
import * as CHECK from '../../../../components/Form/check';
import { loader } from 'graphql.macro';
import { useMutation, useQuery } from '@apollo/react-hooks';
import { GetAllowedEmails } from '../../../../graphql/queries/types/GetAllowedEmails';
import {
  UpdateAllowedEmails,
  UpdateAllowedEmailsVariables
} from '../../../../graphql/mutations/types/UpdateAllowedEmails';
import { mutationPayloadHelper } from '../../../../utils/formUtils';
import { get } from 'lodash';
import FormRowInput from '../FormRowInput/FormRowInput';
import EmailIcon from '@material-ui/icons/AlternateEmail';
import ListItem from '../ListItem/ListItem';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import Message from '../../../../components/Message/Message';
import useUserAccess from '../../../../hooks/useUserAccess';

const GetAllowedEmailsQuery = loader(
  '../../../../graphql/queries/getAllowedEmails.graphql'
);
const UpdateAllowedEmailsMutation = loader(
  '../../../../graphql/mutations/updateAllowedEmails.graphql'
);

function AllowedEmails() {
  const { data, loading, error } = useQuery<GetAllowedEmails>(
    GetAllowedEmailsQuery
  );
  const emails: string[] = get(data, 'settings.authAllowedEmails', []);

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
    }
  });

  function updateEmails(emails: string[]) {
    updateAllowedEmails(mutationPayloadHelper({ authAllowedEmails: emails }));
  }

  function onSubmitEmail(formData: any) {
    updateEmails([...emails, formData.item]);
  }

  function onRemoveEmail(email: string) {
    const newEmails = emails.filter(e => e !== email);
    updateEmails(newEmails);
  }

  function validateEmail(value: string) {
    return CHECK.getValidationError([
      CHECK.isFieldNotEmpty(value),
      CHECK.isEmailValid(value),
      CHECK.isItemDuplicated(value, emails, 'email')
    ]);
  }

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (error) return <ErrorMessage />;
    if (!emails.length)
      return <Message text="There are no emails added to the whitelist." />;

    return emails.map((email: string) => (
      <ListItem key={email} value={email} onDelete={onRemoveEmail} />
    ));
  }

  return (
    <div>
      <FormRowInput
        Icon={EmailIcon}
        field="Email white list"
        inputLabel="email address"
        buttonLabel="ADD EMAIL"
        valueValidator={validateEmail}
        onAction={onSubmitEmail}
      />
      {getContent()}
    </div>
  );
}

export default AllowedEmails;
