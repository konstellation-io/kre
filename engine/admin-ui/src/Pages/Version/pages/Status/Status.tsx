import { ErrorMessage, SpinnerCircular } from 'kwc';
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
import React, { useEffect } from 'react';
import { VersionRouteParams } from 'Constants/routes';
import WorkflowsManager from './components/WorkflowsManager/WorkflowsManager';
import styles from './Status.module.scss';
import useOpenedVersion from 'Graphql/hooks/useOpenedVersion';
import { useParams } from 'react-router';
import { useQuery, useReactiveVar } from '@apollo/client';

import GetVersionWorkflowsQuery from 'Graphql/queries/getVersionWorkflows';
import VersionNodeStatusSubscription from 'Graphql/subscriptions/watchVersionNodeStatus';
import { openedVersion } from '../../../../Graphql/client/cache';

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
  });

  const dataOpenedVersion = useReactiveVar(openedVersion);
  const entrypointStatus =
    dataOpenedVersion.entrypointStatus || NodeStatus.STOPPED;

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

  useEffect(
    () => {
      if(!loading && !error) {
        const unsubscribe = subscribe();
        return unsubscribe;
      }
    },
    [loading, error, subscribe],
  );

  if (error) return <ErrorMessage />;
  if (loading) return <SpinnerCircular />;

  return (
    <div className={styles.container}>
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
