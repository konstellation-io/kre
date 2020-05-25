import React, { useState, useEffect } from 'react';
import Left from '../../Layout/Left/Left';
import Right from '../../Layout/Right/Right';
import GroupElement from './GroupElement';
import IconSelectAll from '@material-ui/icons/DoneAll';
import IconDeselectAll from '@material-ui/icons/ClearAll';
import IconOpen from '@material-ui/icons/KeyboardArrowDown';
import IconClose from '@material-ui/icons/KeyboardArrowUp';
import { GroupSelectData } from './GroupSelect';
import styles from './GroupSelect.module.scss';
import { get } from 'lodash';

const HEIGHT_ELEMENT = 45;

type Props = {
  group: string;
  elements?: string[];
  selections?: GroupSelectData;
  onSelectGroup: (group: string) => void;
  onDeselectGroup: (group: string) => void;
  onSelect: (group: string, element: string) => void;
  onDeselect: (group: string, element: string) => void;
};

function Group({
  group,
  elements = [],
  selections = {},
  onSelectGroup,
  onDeselectGroup,
  onSelect,
  onDeselect
}: Props) {
  const elementsSelected: string[] = get(selections, group, []);
  const [opened, setOpened] = useState(true);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setHeight(opened ? HEIGHT_ELEMENT * elements.length : 0);
  }, [opened, elements.length]);

  function toggleOpened() {
    setOpened(!opened);
  }

  function onSelectDeselect(label: string, add: boolean) {
    if (add) onSelect(group, label);
    else onDeselect(group, label);
  }

  function onSelectAll() {
    onSelectGroup(group);
  }

  function onDeselectAll() {
    onDeselectGroup(group);
  }

  const OpenCloseIcon = opened ? IconClose : IconOpen;

  const allSelected = elements.length === (selections[group] || []).length;
  const groupSelection = {
    Icon: allSelected ? IconDeselectAll : IconSelectAll,
    title: allSelected ? 'Deselect all' : 'Select all',
    action: allSelected ? onDeselectAll : onSelectAll
  };

  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <Left className={styles.name}>
          <>{group}</>
        </Left>
        <Right className={styles.actions}>
          <div
            className={styles.selectAll}
            onClick={groupSelection.action}
            title={groupSelection.title}
          >
            <groupSelection.Icon className="icon-small" />
          </div>
          <div className={styles.toggleVisibility} onClick={toggleOpened}>
            <OpenCloseIcon className="icon-small" />
          </div>
        </Right>
      </div>
      <div className={styles.elements} style={{ height }}>
        {elements.map(element => (
          <GroupElement
            key={element}
            label={element}
            selected={elementsSelected.includes(element)}
            onChange={onSelectDeselect}
          />
        ))}
      </div>
    </div>
  );
}

export default Group;
