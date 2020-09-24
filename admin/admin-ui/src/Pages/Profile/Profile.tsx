import { Button, ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GetApiToken,
  GetApiToken_me_apiToken
} from 'Graphql/queries/types/GetApiToken';
import React, { useState } from 'react';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';

import ApiTokenInfo from './components/ApiTokenInfo/ApiTokenInfo';
import { GenerateApiToken } from 'Graphql/mutations/types/GenerateApiToken';
import NewApiToken from './components/NewApiToken/NewApiToken';
import NoApiTokenMessage from './components/NoApiTokenMessage/NoApiTokenMessage';
import PageBase from 'Components/Layout/PageBase/PageBase';
import SettingsHeader from 'Pages/Settings/components/SettingsHeader/SettingsHeader';
import { loader } from 'graphql.macro';
import styles from './Profile.module.scss';

const getApiTokenDateQuery = loader('Graphql/queries/getApiToken.graphql');
const generateApiTokenMutation = loader(
  'Graphql/mutations/generateApiToken.graphql'
);

function Profile() {
  const [newApiToken, setNewApiToken] = useState<string | null>(null);

  const { cache } = useApolloClient();
  const { data, loading, error } = useQuery<GetApiToken>(getApiTokenDateQuery);
  const [generateApiToken] = useMutation<GenerateApiToken>(
    generateApiTokenMutation,
    {
      onCompleted: newData => {
        // Removes previous apiToken field from cache
        cache.modify({
          id: cache.identify({ ...data?.me }),
          fields: {
            apiToken: (_, { DELETE }) => DELETE
          }
        });

        setNewApiToken(newData.generateApiToken);
      }
    }
  );

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (error || !data) return <ErrorMessage />;

    const apiToken = data.me?.apiToken || null;

    let contentBody: JSX.Element;
    switch (true) {
      case !!newApiToken:
        contentBody = <NewApiToken token={newApiToken || ''} />;
        break;
      case !!apiToken:
        contentBody = (
          <ApiTokenInfo apiToken={apiToken as GetApiToken_me_apiToken} />
        );
        break;
      default:
        contentBody = <NoApiTokenMessage />;
    }

    return (
      <>
        <div className={styles.section}>
          <div className={styles.title}>API Token</div>
          <Button
            label="GENERATE A NEW API TOKEN"
            onClick={generateApiToken}
            disabled={!!newApiToken}
          />
        </div>
        <div className={styles.content}>{contentBody}</div>
      </>
    );
  }

  return (
    <PageBase>
      <div className={styles.container}>
        <SettingsHeader>Profile</SettingsHeader>
        {getContent()}
      </div>
    </PageBase>
  );
}

export default Profile;
