import React from 'react';
import styles from './Workflow.module.scss';
import StatusCircle from '../../../../../../components/StatusCircle/StatusCircle';
import { VersionStatus } from '../../../../../../graphql/types/globalTypes';

type Props = {};

function WorkflowHeader({}: Props) {
  return (
    <div className={styles.workflowHeader}>
      {/* TODO: Update this */}
      <StatusCircle status={VersionStatus.STOPPED} />
      Workflow
    </div>
  );
}

export default WorkflowHeader;
