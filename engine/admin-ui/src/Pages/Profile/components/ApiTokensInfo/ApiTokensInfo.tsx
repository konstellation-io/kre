import {
  GetApiTokens,
  GetApiTokens_me_apiTokens
} from 'Graphql/queries/types/GetApiTokens';
import { ModalContainer, ModalLayoutInfo } from 'kwc';
import React, { useState } from 'react';
import Tag, { TagTypes } from 'Components/Tag/Tag';

import ApiTokenInfo from './ApiTokenInfo';
import { DeleteApiToken } from 'Graphql/mutations/types/DeleteApiToken';
import { mutationPayloadHelper } from 'Utils/formUtils';
import styles from './ApiTokensInfo.module.scss';
import { useMutation } from '@apollo/client';

import getApiTokenDateQuery from 'Graphql/queries/getApiTokens';
import deleteApiTokenMutation from 'Graphql/mutations/deleteApiToken';

type Props = {
  apiTokens: GetApiTokens_me_apiTokens[];
};
function ApiTokensInfo({ apiTokens }: Props) {
  const [deleteApiToken] = useMutation<DeleteApiToken>(deleteApiTokenMutation, {
    update: (cache, { data }) => {
      const oldToken = data?.deleteApiToken;
      const cacheResult = cache.readQuery<GetApiTokens>({
        query: getApiTokenDateQuery
      });

      if (cacheResult !== null && oldToken !== undefined) {
        const { me } = cacheResult;
        cache.writeQuery({
          query: getApiTokenDateQuery,
          data: {
            me: {
              ...me,
              apiTokens: me?.apiTokens.filter(token => token.id !== oldToken.id)
            }
          }
        });
      }
    }
  });

  const [tokenToRemove, setTokenToRemove] = useState<string | null>(null);

  function onDeleteToken() {
    deleteApiToken(mutationPayloadHelper({ id: tokenToRemove }));
    setTokenToRemove(null);
  }

  const tokens = apiTokens.map(token => (
    <ApiTokenInfo
      key={token.id}
      token={token}
      setTokenToRemove={setTokenToRemove}
    />
  ));

  return (
    <div className={styles.apiTokenContent}>
      {tokens}
      {tokenToRemove && (
        <ModalContainer
          title="YOUR API TOKEN WILL BE DELETED"
          actionButtonLabel="DELETE"
          onAccept={onDeleteToken}
          onCancel={() => setTokenToRemove(null)}
          confirmationTimer={3}
          autofocusOnAccept
          blocking
          warning
        >
          <ModalLayoutInfo>
            <>
              <Tag type={TagTypes.WARNING}>WARNING</Tag>
              Previously generated token will be deleted and you will need to
              generate a new one in order to use this functionality.
            </>
          </ModalLayoutInfo>
        </ModalContainer>
      )}
    </div>
  );
}

export default ApiTokensInfo;
