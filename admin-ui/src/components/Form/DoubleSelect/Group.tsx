import React, { useState, useEffect } from 'react';
import Left from '../../Layout/Left/Left';
import Right from '../../Layout/Right/Right';
import Check from '../../Form/Check/Check';
import IconSelectAll from '@material-ui/icons/DoneAll';
import IconDeselectAll from '@material-ui/icons/ClearAll';
import IconOpen from '@material-ui/icons/KeyboardArrowDown';
import IconClose from '@material-ui/icons/KeyboardArrowUp';
import { DoubleSelectData } from './DoubleSelect';
import styles from './DoubleSelect.module.scss';
import { get } from 'lodash';

const HEIGHT_ELEMENT = 45;

type ElementProps = {
  label: string;
  selected: boolean;
  onChange: (label: string, add: boolean) => void;
};

function Element({ label, selected, onChange }: ElementProps) {
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

type Props = {
  group: string;
  elements?: string[];
  selections?: DoubleSelectData;
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
        <Left style={styles.name}>
          <>{group}</>
        </Left>
        <Right style={styles.actions}>
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
          <Element
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
