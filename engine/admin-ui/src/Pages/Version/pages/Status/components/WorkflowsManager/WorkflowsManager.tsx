import React from 'react';
import { NodeStatus, VersionStatus } from 'Graphql/types/globalTypes';
import { GetVersionWorkflows_version_workflows } from 'Graphql/queries/types/GetVersionWorkflows';
import Workflow from '../Workflow/Workflow';
import styles from './WorkflowsManager.module.scss';

type Props = {
  workflows: GetVersionWorkflows_version_workflows[];
  entrypointStatus: NodeStatus;
  entrypointAddress: string;
  versionStatus?: VersionStatus;
};

function WorkflowsManager({
  workflows,
  entrypointStatus,
  entrypointAddress,
  versionStatus = VersionStatus.STOPPED
}: Props) {
  return (
    <div className={styles.workflows}>
      {workflows.map((workflow: GetVersionWorkflows_version_workflows) => (
        <Workflow
          workflow={workflow}
          workflowStatus={versionStatus}
          entrypointStatus={entrypointStatus}
          entrypointAddress={entrypointAddress}
          key={workflow.id}
        />
      ))}
    </div>
  );
}

export default WorkflowsManager;
