import React, {
  useState,
  useEffect,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  ChangeEvent,
  ReactElement
} from 'react';

import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';
import InputHelp from '../InputHelp/InputHelp';
import IconShow from '@material-ui/icons/RemoveRedEye';
import IconHide from '@material-ui/icons/RemoveRedEyeOutlined';
import { isFieldAnInteger } from '../check';

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
  helpText?: string;
  showClearButton?: boolean;
  whiteColor?: boolean;
  onlyNumbers?: boolean;
  positive?: boolean;
  formValue?: string | number;
  customClassname?: string;
  hidden?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
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
  helpText = '',
  showClearButton = false,
  whiteColor = false,
  onlyNumbers = false,
  positive = false,
  formValue = '',
  customClassname = '',
  hidden = false,
  autoFocus = false,
  maxLength
}: Props) {
  const [value, setValue] = useState(formValue);
  const [isHidden, setIsHidden] = useState(hidden);

  useEffect(() => {
    setIsHidden(hidden);
  }, [hidden, setIsHidden]);

  useEffect(() => {
    setValue(formValue);
  }, [formValue, setValue]);

  function updateValue(newValue: string) {
    if (
      !onlyNumbers ||
      (onlyNumbers && isFieldAnInteger(newValue, positive).valid)
    ) {
      setValue(newValue);
      onChange(newValue);
    }
  }

  function onType(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const newValue = e.target.value;

    updateValue(newValue);
  }

  function onKeyPress(
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (e.which === 13 && !textArea) {
      // Enter key
      onSubmit(value);
    }
  }

  function onInputBlur(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    onBlur();
  }

  function toggleVisibility(e: MouseEvent<HTMLDivElement>) {
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
    style: { height },
    maxLength: maxLength
  };
  const inputElement: ReactElement =
    textArea && !isHidden ? (
      <textarea
        {...inputProps}
        data-testid="input"
        style={{ ...limits }}
        autoFocus={autoFocus}
      />
    ) : (
      <input {...inputProps} data-testid="input" autoFocus={autoFocus} />
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
  const showEyeButton = hidden ? (
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
      className={cx(styles.container, customClassname, {
        [styles.white]: whiteColor,
        [styles.hasClearButton]: showClearButton,
        [styles.hasEyeButton]: hidden
      })}
    >
      <InputLabel text={label} />
      {inputElement}
      {cleanButton}
      {showEyeButton}
      {error ? (
        <InputError message={error} />
      ) : (
        <InputHelp message={helpText} />
      )}
    </div>
  );
}

export default TextInput;
