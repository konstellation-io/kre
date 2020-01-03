import { get } from 'lodash';

import React from 'react';
import { useParams, useHistory } from 'react-router';
import * as PAGES from '../../../../constants/routes';

import HorizontalBar from '../../../../components/Layout/HorizontalBar/HorizontalBar';
import Button, { BUTTON_TYPES } from '../../../../components/Button/Button';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import StatusViewer from '../../components/StatusViewer/StatusViewer';

import { useMutation, useQuery } from '@apollo/react-hooks';
import { VersionStatus } from '../../../../graphql/models';
import {
  ACTIVATE_VERSION,
  DEPLOY_VERSION,
  GET_VERSION_WORKFLOWS,
  ActivateVersionResponse,
  DeployVersionResponse,
  ActivateDeployVersionVars,
  GetVersionWorkflowsResponse,
  GetVersionWorkflowsVars
} from './RuntimeStatusPreview.graphql';

import cx from 'classnames';
import styles from './RuntimeStatusPreview.module.scss';

function generateActionButton(label: string, action: Function) {
  return (
    <Button
      key={label}
      label={label}
      onClick={action}
      type={BUTTON_TYPES.DARK}
      height={30}
    />
  );
}

function getStateToButtons(
  activateAction: Function,
  deployAction: Function,
  stopAction: Function,
  deactivateAction: Function
) {
  const buttonDeploy = generateActionButton('DEPLOY', deployAction);
  const buttonStop = generateActionButton('STOP', stopAction);
  const buttonActivate = generateActionButton('ACTIVATE', activateAction);
  const buttonDeactivate = generateActionButton('DEACTIVATE', deactivateAction);

  return {
    [VersionStatus.STOPPED]: [buttonDeploy],
    [VersionStatus.ACTIVE]: [buttonDeactivate],
    [VersionStatus.RUNNING]: [buttonActivate, buttonStop],
    [VersionStatus.CREATED]: [buttonDeploy]
  };
}

function RuntimeStatusPreview() {
  const history = useHistory();
  const { runtimeId, versionId } = useParams();
  const { data, loading, error } = useQuery<
    GetVersionWorkflowsResponse,
    GetVersionWorkflowsVars
  >(GET_VERSION_WORKFLOWS, {
    variables: { versionId },
    fetchPolicy: 'no-cache'
  });
  // TODO: loading and error check
  const [activateMutation] = useMutation<
    ActivateVersionResponse,
    ActivateDeployVersionVars
  >(ACTIVATE_VERSION, { onCompleted: refreshPage });
  const [deployMutation] = useMutation<
    DeployVersionResponse,
    ActivateDeployVersionVars
  >(DEPLOY_VERSION, { onCompleted: refreshPage });

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  function getMutationVars() {
    return {
      variables: {
        input: {
          versionId: versionId || ''
        }
      }
    };
  }
  function refreshPage() {
    history.push('');
    history.replace(
      PAGES.RUNTIME_STATUS_PREVIEW.replace(
        ':runtimeId',
        runtimeId || ''
      ).replace(':versionId', versionId || '')
    );
  }
  function onDeployVersion() {
    deployMutation(getMutationVars());
  }
  function onActivateVersion() {
    activateMutation(getMutationVars());
  }

  const stateToButtons: { [key: string]: any } = getStateToButtons(
    onActivateVersion,
    onDeployVersion,
    function() {},
    function() {}
  );
  const versionStatus = data && data.version && data.version.status;
  const actionButtons: any = stateToButtons[versionStatus || ''];

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
    </div>
  );
}

export default RuntimeStatusPreview;
