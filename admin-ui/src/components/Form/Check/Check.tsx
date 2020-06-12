import React from 'react';
import IconCheck from '@material-ui/icons/Check';
import IconIndeterminate from '@material-ui/icons/Remove';
import styles from './Check.module.scss';
import cx from 'classnames';

type CheckProps = {
  checked: boolean;
  onChange: (add: boolean) => void;
  indeterminate?: boolean;
  className?: string;
};
function Check({
  checked,
  indeterminate,
  onChange,
  className = ''
}: CheckProps) {
  const Icon = indeterminate ? IconIndeterminate : IconCheck;

  return (
    <div
      className={cx(styles.check, className, {
        [styles.checked]: checked,
        [styles.indeterminate]: indeterminate
      })}
      onClick={() => onChange(!checked)}
    >
      <Icon className="icon-regular" />
    </div>
  );
}

export default Check;
