import React, { useState, useEffect } from 'react';

import {isFieldAnInteger} from '../../Form/check'; 

import cx from 'classnames';
import styles from './TextInput.module.scss';


type Props = {
  onSubmit?: Function;
  onChange?: Function;
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
  defaultValue?: any;
};

function TextInput({
  onSubmit = function() {},
  onChange = function() {},
  placeholder = '',
  label = '',
  textArea = false,
  height = 40,
  limits = {},
  error = '',
  showClearButton = false,
  whiteColor = false,
  onlyNumbers = false,
  defaultValue = '',
}: Props) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, setValue]);

  function updateValue(newValue:any) {
    if (!onlyNumbers || (onlyNumbers && isFieldAnInteger(newValue).valid)) {
      setValue(newValue);
      onChange(newValue);
    }
  }

  function onType(e: any) {
    const value = e.target.value;

    updateValue(value);
  }

  function onKeyPress(e: any) {
    if (e.which === 13 && !textArea) {  // Enter key
      onSubmit(value);
    }
  }

  const inputProps = {
    className: cx(styles.input, {
      [styles.error]: error !== '',
    }),
    value: value,
    placeholder: placeholder,
    onChange: onType,
    onKeyPress: onKeyPress,
    style: { ...limits, height },
  };
  const inputElement = textArea ? (
    <textarea {...inputProps} data-testid="input" />
  ) : (
    <input {...inputProps} type="text" data-testid="input" />
  );
  const cleanButton = showClearButton && value !== '' ?
    <div
      className={ styles.clearButton }
      onClick={ () => updateValue('')}
      data-testid="clear-button"
    >x</div>
    : '';

  return (
    <div className={ cx(styles.container, {
      [styles.white]: whiteColor,
      [styles.hasClearButton]: showClearButton
    })}>
      <label className={styles.label} data-testid="label">
        {label.toUpperCase()}
      </label>
      {inputElement}
      {cleanButton}
      <div
        className={cx(styles.errorMessage, { [styles.show]: error !== '' })}
        data-testid="error-message"
      >
        {error}
      </div>
    </div>
  );
}

export default TextInput;
