import React from 'react';
import Select from '../../../../../../components/Form/Select/Select';
import Check from '../../../../../../components/Form/Check/Check';
import styles from './UserFiltersAndActions.module.scss';

function CheckSelectAll() {
  return (
    <div className={styles.selectAll}>
      <Check onChange={() => {}} checked />
      <span>Select All</span>
    </div>
  );
}

type Props = {
  nSelections: number;
};
function UserActions({ nSelections }: Props) {
  const types = ['1', '2', '3', '4', '5'];

  const nSelectionsText = `(${nSelections} selected)`;

  function onAction(action: string) {
    alert(`${action} Selected`);
  }

  return (
    <div className={styles.actions}>
      <CheckSelectAll />
      <span className={styles.nSelections}>{nSelectionsText}</span>
      <div className={styles.formActions}>
        <Select
          label="Actions"
          options={types}
          onChange={onAction}
          placeholder="Select one"
          // valuesMapper={typeToText}
        />
      </div>
    </div>
  );
}

export default UserActions;
