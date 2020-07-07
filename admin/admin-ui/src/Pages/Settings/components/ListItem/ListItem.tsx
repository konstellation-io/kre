import React, { MouseEvent } from 'react';

import Button from 'Components/Button/Button';
import RemoveIcon from '@material-ui/icons/Delete';
import styles from './ListItem.module.scss';

export type Action = {
  label: string;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
};

type Props = {
  value: string;
  onDelete: null | ((value: string) => void);
  actions?: Action[];
};

function ListItem({ value, onDelete, actions = [] }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.value}>{value}</div>
      <div className={styles.actionsContainer}>
        <div className={styles.actions}>
          {actions.map(({ label, onClick }) => (
            <Button label={label} onClick={onClick} key={label} />
          ))}
        </div>
        {onDelete && (
          <div className={styles.removeButton} onClick={() => onDelete(value)}>
            <RemoveIcon className="icon-regular" />
          </div>
        )}
      </div>
    </div>
  );
}

export default ListItem;
