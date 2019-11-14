import React, { useState, useEffect, useRef } from 'react';

import cx from 'classnames';
import styles from './Select.module.scss';

type Props = {
  onChange?: Function;
  label?: string;
  height?: number;
  error?: string;
  whiteColor?: boolean;
  defaultOptionPosition?: number;
  options: string[];
};

function Select({
  options,
  onChange = function() {},
  label = '',
  height = 40,
  error = '',
  whiteColor = false,
  defaultOptionPosition = 0
}: Props) {
  const inputEl = useRef(null);
  const containerEl = useRef(null);
  const [selectedOption, setSelectedOption] = useState(
    options[defaultOptionPosition]
  );
  const [optionsOpened, setOptionsOpened] = useState(false);

  useEffect(() => {
    setSelectedOption(options[defaultOptionPosition]);
  }, [options, defaultOptionPosition, setSelectedOption]);

  function handleClose() {
    document.removeEventListener('contextmenu', handleClose);
    if (containerEl.current) {
      // @ts-ignore
      containerEl.current.removeEventListener('scroll', handleClose);
    }

    setOptionsOpened(false);
  }

  function handleClickOutside(e: any) {
    document.removeEventListener('contextmenu', handleClickOutside);

    // Has the user clicked outside the selector options?
    // @ts-ignore
    if (inputEl.current && !inputEl.current.contains(e.target)) {
      setOptionsOpened(false);
    }
  }

  function handleOnOptionCLick(value: string) {
    //onClick(value);

    document.removeEventListener('contextmenu', handleClickOutside);
    setOptionsOpened(false);
  }

  function openOptions() {
    document.addEventListener('contextmenu', handleClickOutside);
    document.addEventListener('mousedown', handleClose);
    // @ts-ignore
    containerEl.current.addEventListener('scroll', handleClose);

    setOptionsOpened(true);
  }

  //onClick: () => this.handleOnOptionCLick(option.text)

  function updateValue(newValue: any) {
    setSelectedOption(newValue);
    onChange(newValue);
  }

  function onValueChange(e: any) {
    const value = e.target.value;

    updateValue(value);
  }

  const optionList = options.map((option: string, idx: number) => (
    <div key={`selectOption_${idx}`} className={styles.optionElement}>
      {option}
    </div>
  ));
  const optionsHeight = options.length * 40;

  return (
    <div
      className={cx(styles.container, {
        [styles.white]: whiteColor
      })}
      ref={containerEl}
    >
      <label className={styles.label} data-testid="label">
        {label.toUpperCase()}
      </label>
      <div className={styles.inputContainer}>
        <div
          className={cx(styles.input, { [styles.error]: error !== '' })}
          style={{ height }}
          onClick={openOptions}
          ref={inputEl}
        >
          {selectedOption}
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
      <div
        className={cx(styles.errorMessage, { [styles.show]: error !== '' })}
        data-testid="error-message"
      >
        {error}
      </div>
    </div>
  );
}

export default Select;
