import React from 'react';

import IconExpand from '@material-ui/icons/Fullscreen';

import styles from './Box.module.scss';

type Props = {
  onClick: (e: any) => void;
};
function ExpandButton({ onClick }: Props) {
  return (
    <div className={styles.expandIcon} onClick={onClick}>
      <IconExpand className="icon-regular" />
    </div>
  );
}

export default ExpandButton;
