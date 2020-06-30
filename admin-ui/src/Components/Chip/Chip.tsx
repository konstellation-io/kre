import React, { MouseEvent } from 'react';
import IconClose from '@material-ui/icons/Close';
import styles from './Chip.module.scss';

type Props = {
  label: string;
  title?: string;
  onClose?: (event: MouseEvent<HTMLDivElement>) => void;
};
function Chip({ label, title, onClose }: Props) {
  return (
    <div className={styles.chip} title={title || label}>
      <div className={styles.label}>{label}</div>
      {onClose !== undefined && (
        <div className={styles.icon} onClick={onClose}>
          <IconClose className="icon-small" />
        </div>
      )}
    </div>
  );
}

export default Chip;
