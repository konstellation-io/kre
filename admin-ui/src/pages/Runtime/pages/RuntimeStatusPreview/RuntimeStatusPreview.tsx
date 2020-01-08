import { get } from 'lodash';

import React, { useState } from 'react';
import { useParams } from 'react-router';
import * as PAGES from '../../../../constants/routes';

import { getVersionActionButtons } from '../../utils/generators';
import HorizontalBar from '../../../../components/Layout/HorizontalBar/HorizontalBar';
import ConfirmationModal from '../../../../components/ConfirmationModal/ConfirmationModal';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import StatusViewer from '../../components/StatusViewer/StatusViewer';

import { useQuery } from '@apollo/react-hooks';
import useVersionAction from '../../utils/hooks';
import {
  GET_VERSION_WORKFLOWS,
  GetVersionWorkflowsResponse,
  GetVersionWorkflowsVars
} from './RuntimeStatusPreview.graphql';

import cx from 'classnames';
import styles from './RuntimeStatusPreview.module.scss';

function RuntimeStatusPreview() {
  const { runtimeId, versionId } = useParams();
  const { data, loading, error } = useQuery<
    GetVersionWorkflowsResponse,
    GetVersionWorkflowsVars
  >(GET_VERSION_WORKFLOWS, {
    variables: { versionId },
    fetchPolicy: 'no-cache'
  });
  // TODO: loading and error check
  const redirectionPath = PAGES.RUNTIME_STATUS_PREVIEW.replace(
    ':runtimeId',
    runtimeId || ''
  ).replace(':versionId', versionId || '');
  const { activateVersion, deployVersion, getMutationVars } = useVersionAction(
    redirectionPath
  );
  const [showActionConfirmation, setShowActionConfirmation] = useState(false);

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  function onDeployVersion() {
    deployVersion(getMutationVars(versionId || ''));
  }
  function onActivateVersion(comment: string) {
    activateVersion(getMutationVars(versionId || '', comment));
  }

  function onOpenModal() {
    setShowActionConfirmation(true);
  }
  function onCloseModal() {
    setShowActionConfirmation(false);
  }

  const versionStatus = data && data.version && data.version.status;
  const actionButtons: any = getVersionActionButtons(
    onOpenModal,
    onDeployVersion,
    function() {}, // TODO: STOP
    function() {}, // TODO: DEACTIVATE
    versionStatus
  );

  return (
    <div className={styles.container}>
      <HorizontalBar
        style={cx(styles.horizontalBar, styles[versionStatus || ''])}
      >
        <div className={styles.horizontalBarButtons}>{actionButtons}</div>
        <div className={styles.horizontalBarText}>
          <span>{versionStatus}</span>
          <div className={styles.horizontalBarSeparator} />
          <span className={styles.horizontalText2}>Name of the version:</span>
          <span>{data && data.version.name}</span>
        </div>
      </HorizontalBar>
      <StatusViewer
        data={get(data, 'version.workflows', [])}
        status={versionStatus}
      />
      {showActionConfirmation && (
        <ConfirmationModal
          title="YOU ARE ABOUT TO ACTIVATE A VERSION"
          message="And this cannot be undone. Are you sure?"
          onAction={onActivateVersion}
          onClose={onCloseModal}
        />
      )}
    </div>
  );
}

export default RuntimeStatusPreview;
