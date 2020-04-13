import React from 'react';
import styles from './Workflow.module.scss';
import StatusCircle from '../../../../../../components/StatusCircle/StatusCircle';
import { VersionStatus } from '../../../../../../graphql/types/globalTypes';

type Props = {
  status: VersionStatus;
  name?: string;
};

function WorkflowHeader({ name = 'Workflow', status }: Props) {
  return (
    <div className={styles.workflowHeader}>
      <StatusCircle status={status} />
      {name}
    </div>
  );
}

export default WorkflowHeader;
