import React from 'react';
import { useParams } from 'react-router';
import * as ROUTE from '../../../../constants/routes';

import Modal from '../../../../components/Modal/Modal';

function RuntimeStatus() {
  const { runtimeId } = useParams();
  return (
    <>
      <Modal
        title="THERE IS NO RUNTIME VERSIONS"
        message="Please, upload a new version to start working on this runtime"
        actionButtonLabel="NEW VERSION"
        to={ROUTE.NEW_VERSION.replace(':runtimeId', runtimeId || '')}
      />
    </>
  );
}

export default RuntimeStatus;
