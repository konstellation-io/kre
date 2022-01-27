import Can from 'Components/Can/Can';
import React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import { TERMINAL } from 'kwc';
import styles from './Workflow.module.scss';

type Props = {
  onWorkflowClick: Function;
  name?: string;
};

function WorkflowHeader({ name = 'Workflow', onWorkflowClick }: Props) {
  return (
    <div className={styles.workflowHeader}>
      <div>
        <div className={styles.titleName}>Workflow</div>
        <div className={styles.title}>{name}</div>
      </div>
      <Can perform="logs:view">
        <div
          className={styles.button}
          onClick={() => onWorkflowClick()}
          title="Open logs for this workflow"
          data-testid="openWorkflowLogs"
        >
          <SvgIcon className="icon-small">
            <path d={TERMINAL} />
          </SvgIcon>
        </div>
      </Can>
    </div>
  );
}

export default WorkflowHeader;
