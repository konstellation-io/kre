import React from 'react';
import Button from '../../../../components/Button/Button';
import styles from './NoVersionsPanel.module.scss';
import ROUTE from '../../../../constants/routes';
import { Runtime } from '../../../../graphql/models';

type NoVersionsPanelProps = {
  runtime: Runtime;
};

function NoVersionsPanel({ runtime }: NoVersionsPanelProps) {
  const newVersionRoute = ROUTE.NEW_VERSION.replace(':runtimeId', runtime.id);

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>THERE ARE NOT RUNTIME VERSIONS</div>
      <div className={styles.text}>
        Please, upload a new version to begin working on this runtime.
      </div>
      <Button
        label="ADD NEW VERSION"
        primary
        height={30}
        to={newVersionRoute}
      />
    </div>
  );
}

export default NoVersionsPanel;
