import { get } from 'lodash';

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';

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
import { VersionStatus } from '../../../../graphql/models';

import cx from 'classnames';
import styles from './RuntimeStatusPreview.module.scss';
import SpinnerLinear from '../../../../components/LoadingComponents/SpinnerLinear/SpinnerLinear';

const darkLoaderStatus = [
  VersionStatus.RUNNING,
  VersionStatus.STOPPED,
  VersionStatus.ACTIVE
];

function RuntimeStatusPreview() {
  const params: { runtimeId?: string; versionId?: string } = useParams();
  const [versionStatus, setVersionStatus] = useState<VersionStatus | null>(
    null
  );
  const { data, loading, error } = useQuery<
    GetVersionWorkflowsResponse,
    GetVersionWorkflowsVars
  >(GET_VERSION_WORKFLOWS, {
    variables: { versionId: params.versionId },
    fetchPolicy: 'no-cache'
  });

  function onVersionUpdated(response: any) {
    const mutationName = Object.keys(response)[0];
    setVersionStatus(response[mutationName].status);
  }
  const {
    activateVersion,
    deployVersion,
    stopVersion,
    deactivateVersion,
    getMutationVars,
    mutationLoading
  } = useVersionAction(onVersionUpdated);
  const [showActionConfirmation, setShowActionConfirmation] = useState(false);

  useEffect(() => {
    if (data) {
      setVersionStatus(get(data, 'version.status', VersionStatus.CREATED));
    }
  }, [data]);

  if (error || !params.runtimeId || !params.versionId) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  const versionId = params.versionId;

  function onActivateVersion(comment: string) {
    activateVersion(getMutationVars(versionId, comment));
  }
  function onDeactivateVersion() {
    deactivateVersion(getMutationVars(versionId));
  }
  function onDeployVersion() {
    deployVersion(getMutationVars(versionId));
  }
  function onStopVersion() {
    stopVersion(getMutationVars(versionId));
  }

  function onOpenModal() {
    setShowActionConfirmation(true);
  }
  function onCloseModal() {
    setShowActionConfirmation(false);
  }

  let actionButtons: any = getVersionActionButtons(
    onOpenModal,
    onDeployVersion,
    onStopVersion,
    onDeactivateVersion,
    versionStatus || ''
  );

  if (data && !data.version.configurationCompleted) {
    actionButtons = [];
  }

  const workflows = get(data, 'version.workflows', []);

  return (
    <div className={styles.container}>
      <HorizontalBar
        style={cx(styles.horizontalBar, styles[versionStatus || ''])}
      >
        {mutationLoading ? (
          <div className={styles.loadingAction}>
            <SpinnerLinear
              size={60}
              dark={
                (versionStatus && darkLoaderStatus.includes(versionStatus)) ||
                false
              }
            />
          </div>
        ) : (
          <div className={styles.horizontalBarButtons}>{actionButtons}</div>
        )}
        <div className={styles.horizontalBarText}>
          <span>{versionStatus}</span>
          <div className={styles.horizontalBarSeparator} />
          <span className={styles.horizontalText2}>Name of the version:</span>
          <span>{data && data.version.name}</span>
        </div>
      </HorizontalBar>
      {data && versionStatus !== null && (
        <StatusViewer data={workflows} status={versionStatus} />
      )}
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
