import React from 'react';
import { VersionStatus } from '../../graphql/types/globalTypes';
import cx from 'classnames';
import styles from './StatusCircle.module.scss';

type Props = {
  status: VersionStatus;
};

function StatusCircle({ status }: Props) {
  return <div className={cx(styles.circle, styles[status])}></div>;
}

export default StatusCircle;
