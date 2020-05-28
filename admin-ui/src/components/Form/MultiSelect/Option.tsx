import React from 'react';
import Check from '../Check/Check';
import styles from './MultiSelect.module.scss';

type Props = {
  label: string;
  Icon: JSX.Element;
  selected: boolean;
  onChange: (label: string, checked: boolean) => void;
};

function Option({ label, Icon, selected, onChange }: Props) {
  return (
    <div className={styles.optionContainer}>
      <Check
        checked={selected}
        onChange={(checked: boolean) => onChange(label, checked)}
      />
      <div className={styles.label}>{label}</div>
      <div className={styles.icon}>{Icon}</div>
    </div>
  );
}

export default Option;
