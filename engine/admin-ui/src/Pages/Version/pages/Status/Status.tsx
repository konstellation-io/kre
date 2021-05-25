import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GET_ENTRYPOINT_STATUS,
  GetEntrypointStatus
} from 'Graphql/client/queries/getEntrypointStatus.graphql';
import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';
import {
  GetVersionWorkflows,
  GetVersionWorkflowsVariables
} from 'Graphql/queries/types/GetVersionWorkflows';
import {
  WatchVersionNodeStatus,
  WatchVersionNodeStatusVariables
} from 'Graphql/subscriptions/types/WatchVersionNodeStatus';

import { NodeStatus } from 'Graphql/types/globalTypes';
import React from 'react';
import StatusTopInfoBar from './components/StatusTopInfoBar/StatusTopInfoBar';
import { VersionRouteParams } from 'Constants/routes';
import WorkflowsManager from './components/WorkflowsManager/WorkflowsManager';
import { get } from 'lodash';
import styles from './Status.module.scss';
import useOpenedVersion from 'Graphql/hooks/useOpenedVersion';
import { useParams } from 'react-router';
import { useQuery } from '@apollo/client';

import GetVersionWorkflowsQuery from 'Graphql/queries/getVersionWorkflows';
import VersionNodeStatusSubscription from 'Graphql/subscriptions/watchVersionNodeStatus';

export type Node = {
  id: string;
  name?: string;
  status?: NodeStatus;
};

type Props = {
  version?: GetVersionConfStatus_versions;
  runtime?: GetVersionConfStatus_runtime;
};

function Status({ version, runtime }: Props) {
  const { versionName } = useParams<VersionRouteParams>();
  const { updateEntrypointStatus } = useOpenedVersion();

  const { data, loading, error, subscribeToMore } = useQuery<
    GetVersionWorkflows,
    GetVersionWorkflowsVariables
  >(GetVersionWorkflowsQuery, {
    variables: { versionName },
    onCompleted: () => subscribe()
  });

  const { data: localData } = useQuery<GetEntrypointStatus>(
    GET_ENTRYPOINT_STATUS
  );
  const entrypointStatus = get(
    localData?.openedVersion,
    'entrypointStatus',
    NodeStatus.STOPPED
  );

  const subscribe = () =>
    subscribeToMore<WatchVersionNodeStatus, WatchVersionNodeStatusVariables>({
      document: VersionNodeStatusSubscription,
      variables: { versionName },
      updateQuery: (prev, { subscriptionData }) => {
        const node = subscriptionData.data.watchNodeStatus;
        if (node.id === 'entrypoint') {
          updateEntrypointStatus(node.status);
        }

        return prev;
      }
    });

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  return (
    <div className={styles.container}>
      <StatusTopInfoBar />
      <WorkflowsManager
        workflows={data?.version.workflows || []}
        entrypointStatus={entrypointStatus}
        entrypointAddress={runtime?.entrypointAddress || ''}
        versionStatus={version?.status}
      />
    </div>
  );
}

export default Status;
