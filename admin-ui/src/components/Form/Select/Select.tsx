import React, { useState, useEffect, useRef } from 'react';

import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';

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

  /*
   * Adds or removes event listeners and updates options visibility
   */
  function changeOptionsState(show: boolean = false) {
    const listenerAction = show ? 'addEventListener' : 'removeEventListener';

    document[listenerAction]('contextmenu', handleClickOutside);
    document[listenerAction]('click', closeOptions);
    // @ts-ignore
    containerEl.current[listenerAction]('scroll', closeOptions);

    setOptionsOpened(show);
  }

  function openOptions() {
    if (!optionsOpened) changeOptionsState(true);
  }

  function closeOptions() {
    changeOptionsState(false);
  }

  function handleClickOutside(e: any) {
    // Has the user clicked outside the selector options?
    // @ts-ignore
    if (inputEl.current && !inputEl.current.contains(e.target)) {
      closeOptions();
    }
  }

  function handleOnOptionCLick(value: string) {
    closeOptions();
    setSelectedOption(value);
    onChange(value);
  }

  const optionList = options.map((option: string, idx: number) => (
    <div
      key={`selectOption_${idx}`}
      className={styles.optionElement}
      onClick={() => handleOnOptionCLick(option)}
    >
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
      <InputLabel text={label} />
      <div className={styles.inputContainer}>
        <div
          className={cx(styles.input, {
            [styles.error]: error !== '',
            [styles.opened]: optionsOpened
          })}
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
      <InputError message={error} />
    </div>
  );
}

export default Select;
