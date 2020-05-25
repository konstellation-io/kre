import { get } from 'lodash';
import React, { useState, useEffect, useRef, FC } from 'react';
import InputLabel from '../InputLabel/InputLabel';
import useClickOutside from '../../../hooks/useClickOutside';
import InputError from '../InputError/InputError';
import cx from 'classnames';
import styles from './Select.module.scss';

const MAX_HEIGHT = 200;

export enum SelectTheme {
  DEFAULT = 'default',
  LIGHT = 'light'
}

export type CustomOptionProps = {
  label: string;
};

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
  hideError?: boolean;
  className?: string;
  theme?: SelectTheme;
  CustomOptions?: { [key: string]: FC<CustomOptionProps> };
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
  selectMainClass = '',
  hideError = false,
  className = '',
  theme = SelectTheme.DEFAULT,
  CustomOptions = {}
}: Props) {
  const optionsRef = useRef<HTMLDivElement>(null);
  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: optionsRef,
    action: closeOptions
  });
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

  function handleOnOptionCLick(value: string | null) {
    closeOptions();
    setSelectedOption(value);
    onChange(value);
  }

  function renderOption(option: string) {
    const label = get(valuesMapper, option, option);
    const CustomOption = CustomOptions[option];
    return CustomOption ? (
      <CustomOption label={label} />
    ) : (
      <div className={styles.defaultOption}>{label}</div>
    );
  }

  const optionList = (shouldSort ? [...options].sort() : [...options]).map(
    (option: string, idx: number) => (
      <div
        key={`${option}-${idx}`}
        className={cx(styles.optionElement, {
          [styles.selected]: option === selectedOption
        })}
        onClick={() => handleOnOptionCLick(option)}
        ref={option === formSelectedOption ? selectedOptionRef : null}
      >
        {renderOption(option)}
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
      className={cx(
        className,
        styles[theme],
        styles.container,
        selectMainClass,
        {
          [styles.white]: whiteColor
        }
      )}
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
        >
          {get(valuesMapper, selectedOption || '', selectedOption)}
        </div>
        <div
          className={cx(styles.optionsContainer, {
            [styles.opened]: optionsOpened
          })}
          ref={optionsRef}
          style={{ maxHeight: optionsOpened ? optionsHeight : 0 }}
        >
          {optionList}
        </div>
      </div>
      {!hideError && <InputError message={error} />}
    </div>
  );
}

export default Select;
