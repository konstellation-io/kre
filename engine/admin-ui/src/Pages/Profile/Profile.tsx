import { Button, ErrorMessage, SpinnerCircular } from 'kwc';

import ApiTokensInfo from './components/ApiTokensInfo/ApiTokensInfo';
import { GetApiTokens } from 'Graphql/queries/types/GetApiTokens';
import NoApiTokenMessage from './components/NoApiTokenMessage/NoApiTokenMessage';
import PageBase from 'Components/Layout/PageBase/PageBase';
import ROUTE from 'Constants/routes';
import React from 'react';
import SettingsHeader from 'Pages/Settings/components/SettingsHeader/SettingsHeader';
import styles from './Profile.module.scss';
import { useQuery } from '@apollo/client';

import getApiTokenDateQuery from 'Graphql/queries/getApiTokens';

function Profile() {
  const { data, loading, error } = useQuery<GetApiTokens>(getApiTokenDateQuery);

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (error || !data) return <ErrorMessage />;

    const apiTokens = data.me?.apiTokens || null;

    let contentBody =
      apiTokens && apiTokens.length ? (
        <ApiTokensInfo apiTokens={apiTokens} />
      ) : (
        <NoApiTokenMessage />
      );

    return (
      <>
        <div className={styles.section}>
          <div className={styles.title}>API Token</div>
          <Button label="GENERATE A NEW API TOKEN" to={ROUTE.NEW_API_TOKEN} />
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
