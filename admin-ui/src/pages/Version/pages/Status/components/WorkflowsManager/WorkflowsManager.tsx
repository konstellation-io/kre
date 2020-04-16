import React from 'react';
import Workflow from '../Workflow/Workflow';
import { GetVersionWorkflows_version_workflows } from '../../../../../../graphql/queries/types/GetVersionWorkflows';
import { VersionStatus } from '../../../../../../graphql/types/globalTypes';

type Props = {
  workflows: GetVersionWorkflows_version_workflows[];
  versionStatus?: VersionStatus;
};

function WorkflowsManager({
  workflows,
  versionStatus = VersionStatus.STOPPED
}: Props) {
  return (
    <div>
      {workflows.map((workflow: GetVersionWorkflows_version_workflows) => (
        <Workflow
          workflow={workflow}
          workflowStatus={versionStatus}
          key={workflow.id}
        />
      ))}
    </div>
  );
}

export default WorkflowsManager;
