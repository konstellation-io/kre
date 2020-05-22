import React, { useState, useRef } from 'react';

import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';
import useClickOutside from '../../../hooks/useClickOutside';
import Option from './Option';

import cx from 'classnames';
import styles from './MultiSelect.module.scss';

const MAX_HEIGHT = 400;
const OPTION_HEIGHT = 45;

export enum SelectTheme {
  DEFAULT = 'default',
  LIGHT = 'light'
}

export type MultiSelectOption = {
  label: string;
  Icon: JSX.Element;
};

type Props = {
  onChange?: <T>(selections: T[]) => void;
  label?: string;
  selectAllText?: string;
  error?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  formSelectedOptions: string[];
  hideError?: boolean;
  className?: string;
  theme?: SelectTheme;
  selectionUnit?: string;
};

function MultiSelect({
  options,
  onChange = function() {},
  label = '',
  error = '',
  placeholder = '',
  selectAllText = '',
  formSelectedOptions = [],
  hideError = false,
  className = '',
  theme = SelectTheme.DEFAULT,
  selectionUnit = ''
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

  function onSelect(option: string) {
    const newSelection = [...formSelectedOptions].concat([option]);

    if (newSelection.length === options.length) onSelectAll();
    else onChange(newSelection);
  }

  function onDeselect(option: string) {
    const newSelections = [...formSelectedOptions].splice(
      formSelectedOptions.indexOf(option),
      1
    );

    onChange(newSelections);
  }

  function onSelection(option: string, add: boolean) {
    add ? onSelect(option) : onDeselect(option);
  }

  function onSelectAll() {
    onChange([]);
  }

  const optionList = options.map(({ label, Icon }) => (
    <Option
      key={label}
      label={label}
      selected={formSelectedOptions.includes(label)}
      onSelection={onSelection}
      Icon={Icon}
    />
  ));
  if (selectAllText !== '')
    optionList.push(
      <div
        className={cx(styles.selectAll, {
          [styles.selected]: formSelectedOptions.length === 0
        })}
        onClick={onSelectAll}
      >
        {selectAllText}
      </div>
    );

  const optionsHeight = Math.min(
    (options.length + 1) * OPTION_HEIGHT,
    MAX_HEIGHT
  );

  const nSelections = formSelectedOptions.length;
  const placeholderText =
    nSelections === 0
      ? placeholder
      : `${nSelections} ${selectionUnit}${nSelections > 1 ? 'S' : ''}`;

  return (
    <div className={cx(className, styles[theme], styles.container)}>
      {label && <InputLabel text={label} />}
      <div className={styles.inputContainer}>
        <div
          className={cx(styles.input, {
            [styles.error]: error !== '',
            [styles.opened]: optionsOpened,
            [styles.placeholder]: placeholder !== ''
          })}
          onClick={openOptions}
        >
          {placeholderText}
        </div>
        <div
          className={cx(styles.optionsContainer, {
            [styles.opened]: optionsOpened
          })}
          style={{ maxHeight: optionsOpened ? optionsHeight : 0 }}
        >
          <div className={styles.options} ref={optionsRef}>
            {optionList}
          </div>
        </div>
      </div>
      {!hideError && <InputError message={error} />}
    </div>
  );
}

export default MultiSelect;
