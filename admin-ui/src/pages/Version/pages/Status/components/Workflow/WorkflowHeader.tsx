import React from 'react';
import styles from './Workflow.module.scss';
import SvgIcon from '@material-ui/core/SvgIcon';
import * as ICONS from '../../../../../../constants/icons';
import Can from '../../../../../../components/Can/Can';

type Props = {
  onWorkflowClick: Function;
  name?: string;
};

function WorkflowHeader({ name = 'Workflow', onWorkflowClick }: Props) {
  return (
    <div className={styles.workflowHeader}>
      <div className={styles.title}>{name}</div>
      <Can requiresManager>
        <div
          className={styles.button}
          onClick={() => onWorkflowClick()}
          title="Open logs for this workflow"
        >
          <SvgIcon className="icon-small">
            <path d={ICONS.TERMINAL} />
          </SvgIcon>
        </div>
      </Can>
    </div>
  );
}

export default WorkflowHeader;
