import React, { useRef, useState } from 'react';
import { get, isEmpty } from 'lodash';

import Group from './Group';
import InputError from '../InputError/InputError';
import InputLabel from '../InputLabel/InputLabel';
import Selections from './Selections';
import cx from 'classnames';
import styles from './GroupSelect.module.scss';
import useClickOutside from 'Hooks/useClickOutside';

const MAX_HEIGHT = 400;
const GROUP_HEIGHT = 30;
const GROUP_ELEMENT_HEIGHT = 45;

export type GroupSelectData = { [key: string]: string[] };

type Props = {
  onChange?: (selection: GroupSelectData) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  options: GroupSelectData;
  formSelectedOptions?: GroupSelectData;
  hideError?: boolean;
  className?: string;
  hideSelections?: boolean;
};

// Transforms GroupSelectData into a flat version
export function flatSelections(
  options: GroupSelectData,
  selection: GroupSelectData,
  groupLabel: string,
  childrenLabel: string
) {
  const flatSelections: [string, string | { [key: string]: string }][] = [];

  Object.entries(selection).forEach(([group, children]) => {
    const allSelected = options[group]?.length === children.length;

    if (allSelected) {
      flatSelections.push([groupLabel, group]);
    } else {
      children.forEach(child => {
        flatSelections.push([
          childrenLabel,
          {
            [groupLabel]: group,
            [childrenLabel]: child
          }
        ]);
      });
    }
  });

  return flatSelections;
}

function GroupSelect({
  options,
  onChange = function() {},
  label = '',
  error = '',
  placeholder = '',
  formSelectedOptions,
  hideError = false,
  className = '',
  hideSelections = false
}: Props) {
  const optionsRef = useRef<HTMLDivElement>(null);
  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: optionsRef,
    action: closeOptions
  });
  const [optionsOpened, setOptionsOpened] = useState(false);

  function openOptions() {
    if (!optionsOpened) {
      addClickOutsideEvents();
      setOptionsOpened(true);
    }
  }

  function closeOptions() {
    removeClickOutsideEvents();
    setOptionsOpened(false);
  }

  function onClear() {
    onChange({});
  }

  function onSelectGroup(group: string) {
    const newSelections = {
      ...formSelectedOptions,
      [group]: [...options[group]]
    };

    onChange(newSelections);
  }

  function onDeselectGroup(group: string) {
    const newSelections = { ...formSelectedOptions };
    delete newSelections[group];

    onChange(newSelections);
  }

  function onSelect(group: string, element: string) {
    const newSelections = {
      ...formSelectedOptions,
      [group]: [...get(formSelectedOptions, group, []), element]
    };

    onChange(newSelections);
  }
  function onDeselect(group: string, element: string) {
    const groupElements = [...get(formSelectedOptions, group, [])];
    groupElements.splice(groupElements.indexOf(element), 1);

    const newSelections = {
      ...formSelectedOptions,
      [group]: groupElements
    };

    if (isEmpty(groupElements)) {
      delete newSelections[group];
    }

    onChange(newSelections);
  }

  const optionList = Object.entries(options).map(([group, elements]) => (
    <Group
      key={group}
      group={group}
      elements={elements}
      selections={formSelectedOptions}
      onSelectGroup={onSelectGroup}
      onDeselectGroup={onDeselectGroup}
      onSelect={onSelect}
      onDeselect={onDeselect}
    />
  ));

  const nGroups = Object.keys(options).length;
  const nGroupElements = Object.values(options).flat().length;
  const optionsHeight = Math.min(
    nGroups * GROUP_HEIGHT + nGroupElements * GROUP_ELEMENT_HEIGHT,
    MAX_HEIGHT
  );

  const hasSelectedElements = !isEmpty(formSelectedOptions);

  return (
    <div className={styles.container}>
      {label && <InputLabel text={label} />}
      <div className={cx(className, styles.inputContainer)}>
        <div
          className={cx(styles.input, {
            [styles.error]: error !== '',
            [styles.opened]: optionsOpened,
            [styles.placeholder]: placeholder !== ''
          })}
          onClick={openOptions}
        >
          {placeholder}
        </div>
        <div
          className={cx(styles.optionsContainer, {
            [styles.opened]: optionsOpened
          })}
          ref={optionsRef}
          style={{ maxHeight: optionsOpened ? optionsHeight : 0 }}
        >
          {hasSelectedElements && !hideSelections && (
            <Selections
              selections={formSelectedOptions}
              onDeselect={onDeselect}
              onClear={onClear}
            />
          )}
          <div className={styles.options}>{optionList}</div>
        </div>
      </div>
      {!hideError && <InputError message={error} />}
    </div>
  );
}

export default GroupSelect;
