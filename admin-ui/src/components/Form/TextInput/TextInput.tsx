import React, { useState, useEffect } from 'react';

import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';
import IconShow from '@material-ui/icons/RemoveRedEye';
import IconHide from '@material-ui/icons/RemoveRedEyeOutlined';
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
  lockHorizontalGrowth?: boolean;
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
  formValue?: any;
  customStyles?: string;
  hidden?: boolean;
};

function TextInput({
  onSubmit = function() {},
  onChange = function() {},
  onBlur = function() {},
  placeholder = '',
  label = '',
  textArea = false,
  height = 40,
  lockHorizontalGrowth = false,
  limits = {},
  error = '',
  showClearButton = false,
  whiteColor = false,
  onlyNumbers = false,
  positive = false,
  formValue = '',
  customStyles = '',
  hidden = false
}: Props) {
  const [value, setValue] = useState(formValue);
  const [isHidden, setIsHidden] = useState(hidden);

  useEffect(() => {
    setValue(formValue);
  }, [formValue, setValue]);

  function updateValue(newValue: any) {
    if (
      !onlyNumbers ||
      (onlyNumbers && isFieldAnInteger(newValue, positive).valid)
    ) {
      setValue(newValue);
      onChange(newValue);
    }
  }

  function onType(e: any) {
    const newValue = e.target.value;

    updateValue(newValue);
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

  function toggleVisibility(e: any) {
    setIsHidden(!isHidden);
  }

  const inputProps = {
    className: cx(styles.input, {
      [styles.error]: error !== '',
      [styles.lockHorizontalGrowth]: lockHorizontalGrowth
    }),
    value: value,
    type: isHidden ? 'password' : 'text',
    placeholder: placeholder,
    onChange: onType,
    onKeyPress: onKeyPress,
    onBlur: onInputBlur,
    style: { height }
  };
  const inputElement =
    textArea && !isHidden ? (
      <textarea {...inputProps} data-testid="input" style={{ ...limits }} />
    ) : (
      <input {...inputProps} data-testid="input" />
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
  const VisibilityIcon = isHidden ? IconShow : IconHide;
  const showButton = hidden ? (
    <div
      className={cx(styles.eyeButton, {
        [styles.showClearButton]: showClearButton && value !== ''
      })}
      onClick={toggleVisibility}
    >
      <VisibilityIcon className="icon-small" />
    </div>
  ) : (
    ''
  );

  return (
    <div
      className={cx(styles.container, customStyles, {
        [styles.white]: whiteColor,
        [styles.hasClearButton]: showClearButton,
        [styles.hasEyeButton]: hidden
      })}
    >
      <InputLabel text={label} />
      {inputElement}
      {cleanButton}
      {showButton}
      <InputError message={error} />
    </div>
  );
}

export default TextInput;
