import {
  GetVersionWorkflows,
  GetVersionWorkflowsVariables
} from 'Graphql/queries/types/GetVersionWorkflows';

import React from 'react';
import ResourceMetrics from '../ResourceMetrics/ResourceMetrics';
import { VersionRouteParams } from 'Constants/routes';
import { loader } from 'graphql.macro';
import styles from './StatusTopInfoBar.module.scss';
import { useParams } from 'react-router';
import { useQuery } from '@apollo/client';

const GetVersionWorkflowsQuery = loader(
  'Graphql/queries/getVersionWorkflows.graphql'
);

function StatusTopInfoBar() {
  const { versionName } = useParams<VersionRouteParams>();
  const { data } = useQuery<GetVersionWorkflows, GetVersionWorkflowsVariables>(
    GetVersionWorkflowsQuery,
    { variables: { versionName } }
  );

  const nWorkflows = data?.version.workflows.length ?? 0;

  return (
    <div className={styles.container}>
      <div className={styles.nWorkflows}>
        <span>{nWorkflows}</span>
        {` WORKFLOW${nWorkflows > 1 ? 'S' : ''}`}
      </div>
      <div className={styles.workflowsStatus}>{`${nWorkflows} ok`}</div>
      <div className={styles.charts}>{<ResourceMetrics />}</div>
    </div>
  );
}

export default StatusTopInfoBar;
