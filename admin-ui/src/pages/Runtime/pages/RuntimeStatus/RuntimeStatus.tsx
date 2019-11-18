import React from 'react';
import * as ROUTE from '../../../../constants/routes';

import Modal from '../../../../components/Modal/Modal';

import styles from './RuntimeStatus.module.scss';

type Props = {
  history: History;
  location: Location;
};
function RuntimeStatus({ history, location }: Props) {
  return (
    <>
      <Modal
        title="THERE IS NO RUNTIME VERSIONS"
        message="Please, upload a new version to start working on this runtime"
        actionButtonLabel="NEW VERSION"
        to={ROUTE.NEW_VERSION}
      />
    </>
  );
}

export default RuntimeStatus;
