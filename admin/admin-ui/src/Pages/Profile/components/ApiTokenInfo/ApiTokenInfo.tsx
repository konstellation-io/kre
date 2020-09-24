import { Button, ModalContainer, ModalLayoutInfo } from 'kwc';
import React, { useState } from 'react';
import Tag, { TagTypes } from 'Components/Tag/Tag';

import { DeleteApiToken } from 'Graphql/mutations/types/DeleteApiToken';
import DeleteIcon from '@material-ui/icons/Delete';
import { GetApiToken_me_apiToken } from 'Graphql/queries/types/GetApiToken';
import KeyIcon from '@material-ui/icons/VpnKey';
import { formatDate } from 'Utils/format';
import { loader } from 'graphql.macro';
import styles from './ApiTokenInfo.module.scss';
import { useMutation } from '@apollo/client';

const deleteApiTokenMutation = loader(
  'Graphql/mutations/deleteApiToken.graphql'
);

type Props = {
  apiToken: GetApiToken_me_apiToken;
};
function ApiTokenInfo({ apiToken }: Props) {
  const [deleteApiToken] = useMutation<DeleteApiToken>(deleteApiTokenMutation);

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const openModal = () => setShowConfirmationModal(true);
  const closeModal = () => setShowConfirmationModal(false);

  function onDeleteToken() {
    deleteApiToken();
    closeModal();
  }

  return (
    <div className={styles.apiTokenContent}>
      <div className={styles.tokenRow}>
        <div className={styles.info}>
          <div className={styles.title}>
            <KeyIcon className="icon-regular" />
            <p className={styles.date}>
              An API Token was generated on{' '}
              <strong>
                {formatDate(new Date(apiToken.creationDate), true)}
              </strong>
            </p>
          </div>
          <div className={styles.lastUsed}>
            {apiToken.lastActivity ? (
              <>
                <span className={styles.label}>Last used:</span>
                <span className={styles.value}>
                  {formatDate(new Date(apiToken.lastActivity), true)}
                </span>
              </>
            ) : (
              'This token has not been already used.'
            )}
          </div>
        </div>
        <Button label="DELETE" Icon={DeleteIcon} onClick={openModal} />
      </div>
      <div className={styles.warning}>
        <Tag type={TagTypes.INFO}>INFO</Tag> Generating a new API Token will
        remove previously generated API Tokens.
      </div>
      {showConfirmationModal && (
        <ModalContainer
          title="YOUR API TOKEN WILL BE DELETED"
          actionButtonLabel="DELETE"
          onAccept={onDeleteToken}
          onCancel={closeModal}
          confirmationTimer={3}
          autofocusOnAccept
          blocking
          warning
        >
          <ModalLayoutInfo>
            <>
              <Tag type={TagTypes.WARNING}>WARNING</Tag>
              Previously generated token will be deleted and you will need to
              generate a new one in order to continue using Konstellation KLI.
            </>
          </ModalLayoutInfo>
        </ModalContainer>
      )}
    </div>
  );
}

export default ApiTokenInfo;
