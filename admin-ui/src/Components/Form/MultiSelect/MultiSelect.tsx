import React, { useRef, useState } from 'react';

import InputError from '../InputError/InputError';
import InputLabel from '../InputLabel/InputLabel';
import Option from './Option';
import cx from 'classnames';
import styles from './MultiSelect.module.scss';
import useClickOutside from 'Hooks/useClickOutside';

const MAX_HEIGHT = 400;
const OPTION_HEIGHT = 45;

export enum SelectTheme {
  DEFAULT = 'default',
  LIGHT = 'light'
}

export type MultiSelectOption<T> = {
  label: T;
  Icon: JSX.Element;
};

type Props<T> = {
  onChange?: (selections: T[]) => void;
  label?: string;
  selectAllText?: string;
  error?: string;
  placeholder?: string;
  options: MultiSelectOption<T>[];
  formSelectedOptions: T[];
  hideError?: boolean;
  className?: string;
  theme?: SelectTheme;
  selectionUnit?: string;
  iconAtStart?: boolean;
  customLabels?: Map<T, JSX.Element>;
};

function MultiSelect<T>({
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
  selectionUnit = '',
  iconAtStart = false,
  customLabels
}: Props<T>) {
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

  function onSelect(option: T) {
    const newSelection = [...formSelectedOptions].concat([option]);

    if (newSelection.length === options.length) onSelectAll();
    else onChange(newSelection);
  }

  function onDeselect(option: T) {
    const newSelections = formSelectedOptions.filter(o => o !== option);
    onChange(newSelections);
  }

  function onOptionChange(option: T, checked: boolean) {
    checked ? onSelect(option) : onDeselect(option);
  }

  function onSelectAll() {
    onChange([]);
  }

  const optionList = options.map(({ label, Icon }) => (
    <Option<T>
      key={`${label}`}
      label={label}
      selected={formSelectedOptions.includes(label)}
      onChange={onOptionChange}
      Icon={Icon}
      iconAtStart={iconAtStart}
      customLabel={customLabels && customLabels.get(label)}
    />
  ));

  if (selectAllText !== '')
    optionList.push(
      <div
        key={'select_all_row'}
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
