import React from 'react';
import { get, cloneDeep } from 'lodash';
import { useParams } from 'react-router';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import WorkflowsManager from './components/WorkflowsManager/WorkflowsManager';
import StatusTopInfoBar from './components/StatusTopInfoBar/StatusTopInfoBar';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import {
  GetVersionWorkflows,
  GetVersionWorkflowsVariables
} from '../../../../graphql/queries/types/GetVersionWorkflows';

import styles from './Status.module.scss';
import { VersionRouteParams } from '../../../../constants/routes';
import { GetVersionConfStatus_versions } from '../../../../graphql/queries/types/GetVersionConfStatus';
import {
  VersionNodeStatus,
  VersionNodeStatusVariables
} from '../../../../graphql/subscriptions/types/VersionNodeStatus';
import { NodeStatus } from '../../../../graphql/types/globalTypes';

const GetVersionWorkflowsQuery = loader(
  '../../../../graphql/queries/getVersionWorkflows.graphql'
);
const VersionNodeStatusSubscription = loader(
  '../../../../graphql/subscriptions/versionNodeStatus.graphql'
);

export type Node = {
  id: string;
  name?: string;
  status?: NodeStatus;
};

type Props = {
  version?: GetVersionConfStatus_versions;
};

function Status({ version }: Props) {
  const { versionId } = useParams<VersionRouteParams>();

  const { data, loading, error, subscribeToMore } = useQuery<
    GetVersionWorkflows,
    GetVersionWorkflowsVariables
  >(GetVersionWorkflowsQuery, {
    variables: { versionId },
    onCompleted: () => subscribe()
  });

  const subscribe = () =>
    subscribeToMore<VersionNodeStatus, VersionNodeStatusVariables>({
      document: VersionNodeStatusSubscription,
      variables: { versionId },
      updateQuery: (prev, { subscriptionData }) => {
        const nodeInfo = get(subscriptionData, 'data.versionNodeStatus');
        const newData = cloneDeep(prev);

        newData.version.workflows = newData.version.workflows.map(workflow => ({
          ...workflow,
          nodes: workflow.nodes.map(node => ({
            ...node,
            status: node.id === nodeInfo.nodeId ? nodeInfo.status : node.status
          }))
        }));

        return newData;
      }
    });

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  return (
    <div className={styles.container}>
      <StatusTopInfoBar />
      <WorkflowsManager
        workflows={get(data, 'version.workflows', [])}
        versionStatus={version?.status}
      />
    </div>
  );
}

export default Status;
