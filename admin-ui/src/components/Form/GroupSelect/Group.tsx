import React, { useEffect, useState } from 'react';

import GroupElement from './GroupElement';
import { GroupSelectData } from './GroupSelect';
import IconClose from '@material-ui/icons/KeyboardArrowUp';
import IconDeselectAll from '@material-ui/icons/ClearAll';
import IconOpen from '@material-ui/icons/KeyboardArrowDown';
import IconSelectAll from '@material-ui/icons/DoneAll';
import Left from '../../Layout/Left/Left';
import Right from '../../Layout/Right/Right';
import cx from 'classnames';
import { get } from 'lodash';
import styles from './GroupSelect.module.scss';

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

  const nSelections = (selections[group] || []).length;
  const allSelected = elements.length === nSelections;
  const groupSelection = {
    Icon: allSelected ? IconDeselectAll : IconSelectAll,
    title: allSelected ? 'Deselect all' : 'Select all',
    action: allSelected ? onDeselectAll : onSelectAll
  };

  return (
    <div className={styles.group}>
      {group !== '' && (
        <div
          className={cx(styles.groupHeader, {
            [styles.allSelected]: allSelected
          })}
        >
          <Left className={styles.name}>
            <>{group}</>
          </Left>
          <Right className={styles.actions}>
            {nSelections !== 0 && (
              <div className={styles.nSelections}>( {nSelections} )</div>
            )}
            <div
              className={cx(styles.selectAll, {
                [styles.allSelected]: allSelected
              })}
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
      )}
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
