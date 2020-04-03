import React, { MouseEvent } from 'react';
import styles from './LogsList.module.scss';
import cx from 'classnames';

type LoadMoreProps = {
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
};
function LoadMore({ onClick }: LoadMoreProps) {
  return (
    <div
      className={cx(styles.container, styles.loadPreviousLogs)}
      onClick={onClick}
    >
      <span>... Load previous logs</span>
    </div>
  );
}

export default LoadMore;
