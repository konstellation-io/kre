import React, {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useRef,
  useState
} from 'react';

import IconHide from '@material-ui/icons/RemoveRedEyeOutlined';
import IconShow from '@material-ui/icons/RemoveRedEye';
import InputError from '../InputError/InputError';
import InputHelp from '../InputHelp/InputHelp';
import InputInfo from '../InputInfo/InputInfo';
import InputLabel from '../InputLabel/InputLabel';
import cx from 'classnames';
import styles from './TextInput.module.scss';

const KEY_ENTER = 13;

export enum InputType {
  TEXT = 'text',
  NUMBER = 'number',
  PASSWORD = 'password'
}

type Props = {
  onEnterKeyPress?: Function;
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
  type?: InputType;
  formValue?: string | number;
  customClassname?: string;
  hidden?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  additionalInputProps?: object;
  infoMessage?: string | undefined;
  disabled?: boolean;
};

function TextInput({
  onEnterKeyPress = function() {},
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
  type = InputType.TEXT,
  formValue = '',
  customClassname = '',
  hidden = false,
  autoFocus = false,
  maxLength,
  additionalInputProps = {},
  infoMessage = '',
  disabled = false
}: Props) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(formValue);
  const [isHidden, setIsHidden] = useState(hidden);

  useEffect(() => {
    setIsHidden(hidden);
  }, [hidden, setIsHidden]);

  useEffect(() => {
    setValue(formValue);
  }, [formValue, setValue]);

  function updateValue(newValue: string) {
    setValue(newValue);
    onChange(newValue);
  }

  function onType(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const newValue = e.target.value;

    updateValue(newValue);
  }

  function onKeyPress(
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (e.which === KEY_ENTER) {
      if (textArea && e.shiftKey) return;

      onEnterKeyPress();
      textAreaRef?.current && textAreaRef.current.blur();
    }
  }

  function onInputBlur(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    onBlur();
  }

  function toggleVisibility(e: MouseEvent<HTMLDivElement>) {
    setIsHidden(!isHidden);
  }

  const inputProps = {
    ...additionalInputProps,
    className: cx(styles.input, {
      [styles.error]: error !== '',
      [styles.lockHorizontalGrowth]: lockHorizontalGrowth
    }),
    value: value,
    type: isHidden ? InputType.PASSWORD : type,
    placeholder: placeholder,
    onChange: onType,
    onKeyPress,
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
        disabled={disabled}
        ref={textAreaRef}
      />
    ) : (
      <input
        {...inputProps}
        data-testid="input"
        disabled={disabled}
        autoFocus={autoFocus}
      />
    );
  const cleanButton = showClearButton && value !== '' && (
    <div
      className={styles.clearButton}
      onClick={() => updateValue('')}
      data-testid="clear-button"
    >
      x
    </div>
  );
  const VisibilityIcon = isHidden ? IconShow : IconHide;
  const showEyeButton = hidden && (
    <div
      className={cx(styles.eyeButton, {
        [styles.showClearButton]: showClearButton && value !== ''
      })}
      onClick={toggleVisibility}
    >
      <VisibilityIcon className="icon-small" />
    </div>
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
      <InputInfo message={infoMessage} />
      {error ? (
        <InputError message={error} />
      ) : (
        <InputHelp message={helpText} />
      )}
    </div>
  );
}

export default TextInput;
