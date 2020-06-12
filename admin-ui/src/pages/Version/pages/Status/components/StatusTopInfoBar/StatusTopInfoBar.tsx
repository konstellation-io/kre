import React from 'react';
import ResourceMetrics from '../ResourceMetrics/ResourceMetrics';
import styles from './StatusTopInfoBar.module.scss';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/react-hooks';
import {
  GetVersionWorkflows,
  GetVersionWorkflowsVariables
} from '../../../../../../graphql/queries/types/GetVersionWorkflows';
import { VersionRouteParams } from '../../../../../../constants/routes';
import { useParams } from 'react-router';

const GetVersionWorkflowsQuery = loader(
  '../../../../../../graphql/queries/getVersionWorkflows.graphql'
);

function StatusTopInfoBar() {
  const { versionId } = useParams<VersionRouteParams>();
  const { data } = useQuery<GetVersionWorkflows, GetVersionWorkflowsVariables>(
    GetVersionWorkflowsQuery,
    { variables: { versionId } }
  );

  const nWorkflows = data?.version.workflows.length ?? 0;

  return (
    <div className={styles.container}>
      <div className={styles.nWorkflows}>
        <span>{nWorkflows}</span>
        {` WORKFLOW${nWorkflows > 1 ? 'S' : ''}`}
      </div>
      <div className={styles.workflowsStatus}>3 ok</div>
      <div className={styles.charts}>{<ResourceMetrics />}</div>
    </div>
  );
}

export default StatusTopInfoBar;
