import { get } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';

import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';

import cx from 'classnames';
import styles from './Select.module.scss';

const MAX_HEIGHT = 200;

type Props = {
  onChange?: Function;
  label?: string;
  height?: number;
  error?: string;
  whiteColor?: boolean;
  shouldSort?: boolean;
  placeholder?: string;
  defaultOption?: string;
  options: string[];
  formSelectedOption?: string;
  valuesMapper?: { [key: string]: string };
  selectMainClass?: string;
};

function Select({
  options,
  onChange = function() {},
  label = '',
  height = 40,
  error = '',
  whiteColor = false,
  shouldSort = true,
  defaultOption,
  placeholder = '',
  formSelectedOption,
  valuesMapper = {},
  selectMainClass = ''
}: Props) {
  const inputEl = useRef<HTMLInputElement>(null);
  const containerEl = useRef<HTMLDivElement>(null);
  const selectedOptionRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = useState<
    string | undefined | null
  >(placeholder || defaultOption);
  const [optionsOpened, setOptionsOpened] = useState(false);

  useEffect(() => {
    setSelectedOption(formSelectedOption || placeholder || defaultOption);
  }, [
    options,
    defaultOption,
    selectedOption,
    setSelectedOption,
    formSelectedOption,
    placeholder
  ]);

  useEffect(() => {
    if (optionsOpened && selectedOptionRef.current !== null) {
      selectedOptionRef.current?.scrollIntoView({
        block: 'end'
      });
    }
  }, [optionsOpened]);

  /*
   * Adds or removes event listeners and updates options visibility
   */
  function changeOptionsState(show: boolean = false) {
    const listenerAction = show ? 'addEventListener' : 'removeEventListener';

    document[listenerAction]('contextmenu', handleClickOutside);
    document[listenerAction]('click', closeOptions);

    if (containerEl.current !== null) {
      containerEl.current[listenerAction]('scroll', closeOptions);
    }

    setOptionsOpened(show);
  }

  function openOptions() {
    if (!optionsOpened) changeOptionsState(true);
  }

  function closeOptions() {
    changeOptionsState(false);
  }

  function handleClickOutside(e: Event) {
    const inputNode = inputEl.current;
    const target = e.target as HTMLElement;
    // Has the user clicked outside the selector options?
    if (inputNode !== null && !inputNode.contains(target)) {
      closeOptions();
    }
  }

  function handleOnOptionCLick(value: string | null) {
    closeOptions();
    setSelectedOption(value);
    onChange(value);
  }

  const optionList = (shouldSort ? [...options].sort() : [...options]).map(
    (option: string, idx: number) => (
      <div
        key={`${option}-${idx}`}
        className={styles.optionElement}
        onClick={() => handleOnOptionCLick(option)}
        ref={option === formSelectedOption ? selectedOptionRef : null}
      >
        {get(valuesMapper, option, option)}
      </div>
    )
  );
  if (placeholder) {
    optionList.unshift(
      <div
        key={`selectOption_empty`}
        className={styles.optionElement}
        onClick={() => handleOnOptionCLick(null)}
      >
        All
      </div>
    );
  }
  const optionsHeight = Math.min(optionList.length * 40, MAX_HEIGHT);

  return (
    <div
      className={cx(styles.container, selectMainClass, {
        [styles.white]: whiteColor
      })}
      ref={containerEl}
    >
      {label && (
        <InputLabel text={label} hidden={selectedOption === placeholder} />
      )}
      <div className={styles.inputContainer}>
        <div
          className={cx(styles.input, {
            [styles.error]: error !== '',
            [styles.opened]: optionsOpened,
            [styles.placeholder]: placeholder === selectedOption
          })}
          style={{ height }}
          onClick={openOptions}
          ref={inputEl}
        >
          {get(valuesMapper, selectedOption || '', selectedOption)}
        </div>
        <div
          className={cx(styles.optionsContainer, {
            [styles.opened]: optionsOpened
          })}
          style={{ maxHeight: optionsOpened ? optionsHeight : 0 }}
        >
          {optionList}
        </div>
      </div>
      <InputError message={error} />
    </div>
  );
}

export default Select;
