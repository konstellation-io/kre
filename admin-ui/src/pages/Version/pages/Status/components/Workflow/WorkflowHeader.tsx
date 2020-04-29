import React from 'react';
import styles from './Workflow.module.scss';
import SvgIcon from '@material-ui/core/SvgIcon';
import * as ICONS from '../../../../../../constants/icons';
import useUserAccess from '../../../../../../hooks/useUserAccess';

type Props = {
  onWorkflowClick: Function;
  name?: string;
};

function WorkflowHeader({ name = 'Workflow', onWorkflowClick }: Props) {
  const { userHasAllAccesses } = useUserAccess();

  return (
    <div className={styles.workflowHeader}>
      <div className={styles.title}>{name}</div>
      {userHasAllAccesses && (
        <div
          className={styles.button}
          onClick={() => onWorkflowClick()}
          title="Open logs for this workflow"
        >
          <SvgIcon className="icon-small">
            <path d={ICONS.TERMINAL} />
          </SvgIcon>
        </div>
      )}
    </div>
  );
}

export default WorkflowHeader;
