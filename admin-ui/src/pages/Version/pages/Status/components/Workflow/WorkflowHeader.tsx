import React from 'react';
import styles from './Workflow.module.scss';
import StatusCircle from '../../../../../../components/StatusCircle/StatusCircle';
import SvgIcon from '@material-ui/core/SvgIcon';
import * as ICONS from '../../../../../../constants/icons';
import { VersionStatus } from '../../../../../../graphql/types/globalTypes';

type Props = {
  status: VersionStatus;
  onWorkflowClick: Function;
  name?: string;
};

function WorkflowHeader({ name = 'Workflow', status, onWorkflowClick }: Props) {
  return (
    <div className={styles.workflowHeader}>
      <div className={styles.title}>
        <StatusCircle status={status} />
        {name}
      </div>
      <div
        className={styles.button}
        onClick={() => onWorkflowClick()}
        title="Open logs for this workflow"
      >
        <SvgIcon className="icon-small">
          <path d={ICONS.TERMINAL} />
        </SvgIcon>
      </div>
    </div>
  );
}

export default WorkflowHeader;
