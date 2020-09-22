import { GetVersionConfStatus_runtime } from 'Graphql/queries/types/GetVersionConfStatus';
import IconOpenInTab from '@material-ui/icons/Tab';
import React from 'react';
import styles from './RuntimeMenu.module.scss';

type BlackLinkButton = {
  label: string;
  to: string;
};

function BlankLinkButton({ label, to }: BlackLinkButton) {
  return (
    <div className={styles.link}>
      <div className={styles.icon}>
        <IconOpenInTab className="icon-small" />
      </div>
      <a href={to} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    </div>
  );
}

type Props = {
  runtime: GetVersionConfStatus_runtime;
};

function RuntimeMenu({ runtime }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.links}>
        <BlankLinkButton label="DATABASE" to={''} />
        <BlankLinkButton label="METRICS" to={runtime.measurementsUrl} />
      </div>
    </div>
  );
}

export default RuntimeMenu;
