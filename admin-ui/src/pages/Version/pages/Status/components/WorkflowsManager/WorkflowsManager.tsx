import React from 'react';
import Workflow from '../Workflow/Workflow';
import { GetVersionWorkflows_version_workflows } from '../../../../../../graphql/queries/types/GetVersionWorkflows';
import styles from './WorkflowsManager.module.scss';

type Props = {
  workflows: GetVersionWorkflows_version_workflows[];
};

function WorkflowsManager({ workflows }: Props) {
  const workflowElements = workflows.map(
    (workflow: GetVersionWorkflows_version_workflows, idx: number) => (
      <Workflow workflow={workflow} idx={idx} />
    )
  );

  return <div>{workflowElements}</div>;
}

export default WorkflowsManager;
