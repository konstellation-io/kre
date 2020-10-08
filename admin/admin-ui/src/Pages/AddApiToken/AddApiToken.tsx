import { Button, CHECK, TextInput } from 'kwc';
import {
  GenerateApiToken,
  GenerateApiTokenVariables
} from 'Graphql/mutations/types/GenerateApiToken';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';

import { GetMe } from 'Graphql/queries/types/GetMe';
import NewApiToken from './components/NewApiToken/NewApiToken';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';
import styles from './AddApiToken.module.scss';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');
const generateApiTokenMutation = loader(
  'Graphql/mutations/generateApiToken.graphql'
);

function verifyName(value: string) {
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(value)]);
}

type FormData = {
  name: string;
};

function AddApiToken() {
  const history = useHistory();
  const { cache } = useApolloClient();
  const [newApiToken, setNewApiToken] = useState<string | null>(null);

  const { handleSubmit, setValue, register, unregister, errors } = useForm<
    FormData
  >({ defaultValues: { name: '' } });

  const { data: userData } = useQuery<GetMe>(GetMeQuery);
  const [generateApiToken, { loading }] = useMutation<
    GenerateApiToken,
    GenerateApiTokenVariables
  >(generateApiTokenMutation, {
    onCompleted: onCompleteGenerateApiToken,
    onError: e => console.error(`generateApiToken: ${e}`)
  });

  useEffect(() => {
    register('name', { validate: verifyName });

    return () => unregister('name');
  }, [register, unregister, setValue]);

  function onCompleteGenerateApiToken(data: GenerateApiToken) {
    setNewApiToken(data.generateApiToken);

    cache.modify({
      id: cache.identify({ ...userData?.me }),
      fields: {
        apiTokens: (_, { DELETE }) => DELETE
      }
    });
  }

  function onSubmit(formData: FormData) {
    generateApiToken(mutationPayloadHelper(formData));
  }

  function getContent() {
    if (newApiToken) return <NewApiToken token={newApiToken} />;

    return (
      <>
        <TextInput
          whiteColor
          label="token name"
          error={get(errors.name, 'message') as string}
          onChange={(value: string) => setValue('name', value)}
          onEnterKeyPress={handleSubmit(onSubmit)}
          autoFocus
        />
        <div className={styles.buttons}>
          <Button
            primary
            label="SAVE"
            onClick={handleSubmit(onSubmit)}
            loading={loading}
            className={styles.buttonSave}
            tabIndex={0}
          />
          <Button
            label="CANCEL"
            onClick={() => history.goBack()}
            tabIndex={0}
          />
        </div>
      </>
    );
  }

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>New API Token</h1>
          <div className={styles.content}>{getContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default AddApiToken;
