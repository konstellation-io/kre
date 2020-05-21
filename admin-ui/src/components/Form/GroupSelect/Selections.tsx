import React from 'react';
import Button from '../../Button/Button';
import Chip from '../../Chip/Chip';
import { GroupSelectData } from './GroupSelect';
import styles from './GroupSelect.module.scss';

type Props = {
  selections?: GroupSelectData;
  onDeselect: (group: string, element: string) => void;
  onClear: () => void;
};

function Selections({ selections = {}, onClear, onDeselect }: Props) {
  const selectionsArray = Object.entries(selections)
    .map(([group, elements]) => elements.map(element => ({ group, element })))
    .flat();
  const selectionNodes = selectionsArray.map(({ group, element }) => (
    <Chip
      key={`${group}${element}`}
      label={`${group}: ${element}`}
      onClose={() => onDeselect(group, element)}
    />
  ));

  return (
    <div className={styles.selectionsContainer}>
      {selectionNodes}
      <div className={styles.clear} onClick={onClear}>
        <Button label="CLEAR" height={24} />
      </div>
    </div>
  );
}

export default Selections;
