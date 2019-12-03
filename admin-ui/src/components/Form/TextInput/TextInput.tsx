import React, { useState, useEffect } from 'react';

import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';
import { isFieldAnInteger } from '../../Form/check';

import cx from 'classnames';
import styles from './TextInput.module.scss';

type Props = {
  onSubmit?: Function;
  onChange?: Function;
  onBlur?: Function;
  placeholder?: string;
  label?: string;
  textArea?: boolean;
  height?: number;
  limits?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
  error?: string;
  showClearButton?: boolean;
  whiteColor?: boolean;
  onlyNumbers?: boolean;
  positive?: boolean;
  defaultValue?: any;
};

function TextInput({
  onSubmit = function() {},
  onChange = function() {},
  onBlur = function() {},
  placeholder = '',
  label = '',
  textArea = false,
  height = 40,
  limits = {},
  error = '',
  showClearButton = false,
  whiteColor = false,
  onlyNumbers = false,
  positive = false,
  defaultValue = ''
}: Props) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  function updateValue(newValue: any) {
    if (!onlyNumbers || (onlyNumbers && isFieldAnInteger(newValue, positive).valid)) {
      setValue(newValue);
      onChange(newValue);
    }
  }

  function onType(e: any) {
    const value = e.target.value;

    updateValue(value);
  }

  function onKeyPress(e: any) {
    if (e.which === 13 && !textArea) {
      // Enter key
      onSubmit(value);
    }
  }

  function onInputBlur(e: any) {
    onBlur();
  }

  const inputProps = {
    className: cx(styles.input, {
      [styles.error]: error !== ''
    }),
    value: value,
    placeholder: placeholder,
    onChange: onType,
    onKeyPress: onKeyPress,
    onBlur: onInputBlur,
    style: { ...limits, height }
  };
  const inputElement = textArea ? (
    <textarea {...inputProps} data-testid="input" />
  ) : (
    <input {...inputProps} type="text" data-testid="input" />
  );
  const cleanButton =
    showClearButton && value !== '' ? (
      <div
        className={styles.clearButton}
        onClick={() => updateValue('')}
        data-testid="clear-button"
      >
        x
      </div>
    ) : (
      ''
    );

  return (
    <div
      className={cx(styles.container, {
        [styles.white]: whiteColor,
        [styles.hasClearButton]: showClearButton
      })}
    >
      <InputLabel text={label} />
      {inputElement}
      {cleanButton}
      <InputError message={error} />
    </div>
  );
}

export default TextInput;
