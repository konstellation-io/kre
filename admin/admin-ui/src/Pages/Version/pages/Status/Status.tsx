import {
  GetVersionWorkflows,
  GetVersionWorkflowsVariables
} from 'Graphql/queries/types/GetVersionWorkflows';
import {
  WatchVersionNodeStatus,
  WatchVersionNodeStatusVariables
} from 'Graphql/subscriptions/types/WatchVersionNodeStatus';

import ErrorMessage from 'Components/ErrorMessage/ErrorMessage';
import { GetVersionConfStatus_versions } from 'Graphql/queries/types/GetVersionConfStatus';
import { NodeStatus } from 'Graphql/types/globalTypes';
import React from 'react';
import SpinnerCircular from 'Components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import StatusTopInfoBar from './components/StatusTopInfoBar/StatusTopInfoBar';
import { VersionRouteParams } from 'Constants/routes';
import WorkflowsManager from './components/WorkflowsManager/WorkflowsManager';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import styles from './Status.module.scss';
import { useParams } from 'react-router';
import { useQuery } from '@apollo/react-hooks';

const GetVersionWorkflowsQuery = loader(
  'Graphql/queries/getVersionWorkflows.graphql'
);
const VersionNodeStatusSubscription = loader(
  'Graphql/subscriptions/watchVersionNodeStatus.graphql'
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
    subscribeToMore<WatchVersionNodeStatus, WatchVersionNodeStatusVariables>({
      document: VersionNodeStatusSubscription,
      variables: { versionId }
    });

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  return (
    <div className={styles.container}>
      <StatusTopInfoBar />
      <WorkflowsManager
        workflows={data?.version.workflows || []}
        entrypointStatus={get(
          data?.version.entrypoint,
          'status',
          NodeStatus.STARTED
        )}
        versionStatus={version?.status}
      />
    </div>
  );
}

export default Status;
