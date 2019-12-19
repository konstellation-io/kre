import { get } from 'lodash';

import React from 'react';
import { useParams } from 'react-router';

import HorizontalBar from '../../../../components/Layout/HorizontalBar/HorizontalBar';
import Button, { BUTTON_TYPES } from '../../../../components/Button/Button';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import { TYPES, STATUS } from '../../../../components/Shape/Node/Node';
import StatusViewer from '../../components/StatusViewer/StatusViewer';

import { useMutation, useQuery } from '@apollo/react-hooks';
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

import styles from './RuntimeStatusPreview.module.scss';

const data = [
  {
    name: 'MAKE_PREDICTION',
    nodes: [
      {
        id: 'W1InputNode',
        name: 'TICKET ASSET',
        status: '',
        type: TYPES.INPUT
      },
      {
        id: 'W1InnerNode1',
        name: 'TICKET STATUS TRANSFORMER',
        status: '',
        type: TYPES.DEFAULT_2
      },
      {
        id: 'W1InnerNode2',
        name: 'TICKET STATUS NORMALIZATOR',
        status: '',
        type: TYPES.DEFAULT_2
      },
      {
        id: 'W1InnerNode3',
        name: 'TICKET CLASIFICATOR NN',
        status: '',
        type: TYPES.DEFAULT_2
      },
      {
        id: 'W1OutputNode',
        name: 'TNBA ORDERED',
        status: '',
        type: TYPES.OUTPUT
      }
    ],
    edges: [
      {
        id: 'Edge1',
        name: 'Edge1',
        status: STATUS.ACTIVE,
        value: 0,
        from: 'W1InputNode',
        to: 'W1InnerNode1'
      },
      {
        id: 'Edge2',
        name: 'Edge2',
        status: STATUS.ACTIVE,
        value: 0,
        from: 'W1InnerNode1',
        to: 'W1InnerNode2'
      },
      {
        id: 'Edge3',
        name: 'Edge3',
        status: STATUS.ACTIVE,
        value: 0,
        from: 'W1InnerNode2',
        to: 'W1InnerNode3'
      },
      {
        id: 'Edge4',
        name: 'Edge4',
        status: STATUS.ACTIVE,
        value: 0,
        from: 'W1InnerNode3',
        to: 'W1OutputNode'
      }
    ]
  },
  {
    name: 'SAVE_CLIENT_METRICS',
    nodes: [
      {
        id: 'W2InputNode',
        name: 'TICKET ASSET',
        status: '',
        type: TYPES.INPUT
      },
      {
        id: 'W2InnerNode1',
        name: 'TICKET STATUS TRANSFORMER',
        status: '',
        type: TYPES.DEFAULT
      },
      {
        id: 'W2InnerNode2',
        name: 'TICKET STATUS NORMALIZATOR',
        status: '',
        type: TYPES.DEFAULT
      },
      {
        id: 'W2OutputNode',
        name: 'TNBA ORDERED',
        status: '',
        type: TYPES.OUTPUT
      }
    ],
    edges: [
      {
        id: 'Edge1',
        name: 'Edge1',
        status: STATUS.ACTIVE,
        value: 0,
        from: 'W2InputNode',
        to: 'W2InnerNode1'
      },
      {
        id: 'Edge2',
        name: 'Edge2',
        status: STATUS.ACTIVE,
        value: 0,
        from: 'W2InnerNode1',
        to: 'W2InnerNode2'
      },
      {
        id: 'Edge3',
        name: 'Edge3',
        status: STATUS.ACTIVE,
        value: 0,
        from: 'W2InnerNode2',
        to: 'W2OutputNode'
      }
    ]
  }
];

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
    STOPPED: [buttonDeploy],
    ACTIVE: [buttonDeactivate],
    RUNNING: [buttonActivate, buttonStop],
    CREATED: [buttonDeploy]
  };
}

function RuntimeStatusPreview() {
  const { versionId } = useParams();
  const { data, loading, error } = useQuery<
    GetVersionWorkflowsResponse,
    GetVersionWorkflowsVars
  >(GET_VERSION_WORKFLOWS, { variables: { versionId } });
  // TODO: loading and error check
  const [activateMutation] = useMutation<
    ActivateVersionResponse,
    ActivateDeployVersionVars
  >(ACTIVATE_VERSION);
  const [deployMutation] = useMutation<
    DeployVersionResponse,
    ActivateDeployVersionVars
  >(DEPLOY_VERSION);

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
      <HorizontalBar style={styles.horizontalBar}>
        <div className={styles.horizontalBarButtons}>{actionButtons}</div>
        <div className={styles.horizontalBarText}>
          <span>PREVIEW MODE</span>
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
