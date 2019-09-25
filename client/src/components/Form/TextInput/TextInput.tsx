import React, { useState } from 'react';
import cx from 'classnames';
import styles from './TextInput.module.scss';

type Props = {
  onSummit?: Function;
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
};

function TextInput({
  onSummit = function() {},
  onChange = function() {},
  placeholder = '',
  label = '',
  textArea = false,
  height = 40,
  limits = {},
  error = '',
}: Props = {}) {
  const [value, setValue] = useState('');

  function onType(e: any) {
    const value = e.target.value;

    setValue(value);
    onChange(value);
  }

  function onKeyPress(e: any) {
    if (e.which === 13 && !textArea) {
      onSummit(value);
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
    <textarea {...inputProps} />
  ) : (
    <input {...inputProps} type="text" />
  );

  return (
    <div>
      <label className={styles.label}>{label.toUpperCase()}</label>
      {inputElement}
      <div className={cx(styles.errorMessage, { [styles.show]: error !== '' })}>
        {error}
      </div>
    </div>
  );
}

export default TextInput;
