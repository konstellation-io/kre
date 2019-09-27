import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
}: Props = {}) {
  const [value, setValue] = useState('');

  function onType(e: any) {
    const value = e.target.value;

    setValue(value);
    onChange(value);
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
    <textarea {...inputProps} data-testid="email-input" />
  ) : (
    <input {...inputProps} type="text" data-testid="email-input" />
  );
  const cleanButton = showClearButton && value !== '' ?
    <div
      className={ styles.clearButton }
      onClick={ () => setValue('') }
      data-testid="clear-button"
    >x</div>
    : '';

  return (
    <div className={ cx(styles.container, {
      [styles.white]: whiteColor,
      [styles.hasClearButton]: showClearButton
    })}>
      <label className={styles.label} data-testid="email-label">
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

TextInput.propTypes = {
  /** Additional logic to execute after summiting */
  onSubmit: PropTypes.func,
  /** Additional logic to execute after updating the input value */
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  /** Label showed at the top of the input */
  label: PropTypes.string,
  /** If true, text input will accept multiline input */
  textArea: PropTypes.bool,
  height: PropTypes.number,
  /** limits the size textarea can grow to */
  limits: PropTypes.shape({
    minWidth: PropTypes.number,
    maxWidth: PropTypes.number,
    minHeight: PropTypes.number,
    maxHeight: PropTypes.number,
  }),
  error: PropTypes.string,
  /** Adds an 'x' button to clear the input */
  showClearButton: PropTypes.bool,
  /** font color will be brighter */
  whiteColor: PropTypes.bool,
};

export default TextInput;
