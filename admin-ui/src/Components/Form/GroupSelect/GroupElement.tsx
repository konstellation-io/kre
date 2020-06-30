import React from 'react';
import Check from '../Check/Check';
import styles from './GroupSelect.module.scss';

type Props = {
  label: string;
  selected: boolean;
  onChange: (label: string, add: boolean) => void;
};

function GroupElement({ label, selected, onChange }: Props) {
  return (
    <div className={styles.elementContainer}>
      <Check
        checked={selected}
        onChange={(add: boolean) => onChange(label, add)}
      />
      <div className={styles.label}>{label}</div>
    </div>
  );
}

export default GroupElement;
