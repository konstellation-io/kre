import React from 'react';
import Check from '../Check/Check';
import styles from './MultiSelect.module.scss';

type Props = {
  label: string;
  Icon: JSX.Element;
  selected: boolean;
  onSelection: (label: string, add: boolean) => void;
};

function Option({ label, Icon, selected, onSelection }: Props) {
  return (
    <div className={styles.optionContainer}>
      <Check
        checked={selected}
        onChange={(add: boolean) => onSelection(label, add)}
      />
      <div className={styles.label}>{label}</div>
      <div className={styles.icon}>{Icon}</div>
    </div>
  );
}

export default Option;
