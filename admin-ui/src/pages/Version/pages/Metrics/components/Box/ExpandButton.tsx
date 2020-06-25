import React, { MouseEvent } from 'react';

import Button from '../../../../../../components/Button/Button';
import IconExpand from '@material-ui/icons/Fullscreen';
import styles from './Box.module.scss';

type Props = {
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
};
function ExpandButton({ onClick }: Props) {
  return (
    <Button
      className={styles.expandIcon}
      Icon={IconExpand}
      iconSize="icon-regular"
      label=""
      onClick={onClick}
    />
  );
}

export default ExpandButton;
