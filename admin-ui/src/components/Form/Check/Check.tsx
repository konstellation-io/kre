import React from 'react';
import IconCheck from '@material-ui/icons/Check';
import styles from './Check.module.scss';
import cx from 'classnames';

type CheckProps = {
  checked: boolean;
  onChange: (add: boolean) => void;
};
function Check({ checked, onChange }: CheckProps) {
  return (
    <div
      className={cx(styles.check, { [styles.checked]: checked })}
      onClick={() => onChange(!checked)}
    >
      <IconCheck className="icon-regular" />
    </div>
  );
}

export default Check;
