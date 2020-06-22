import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from 'react';
import styles from './SearchSelect.module.scss';
import InputLabel from '../InputLabel/InputLabel';
import InputError from '../InputError/InputError';
import SearchIcon from '@material-ui/icons/Search';
import useClickOutside from '../../../hooks/useClickOutside';
import cx from 'classnames';

export const ARROW_UP_KEY_CODE = 38;
export const ARROW_DOWN_KEY_CODE = 40;
export const ENTER_KEY_CODE = 13;

type Props = {
  options: string[];
  onChange?: Function;
  onEnter?: Function;
  value?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  name?: string;
  inputRef?: React.Ref<any>;
  hideError?: boolean;
  hideLabel?: boolean;
  showSearchIcon?: boolean;
  className?: string;
};

function SearchSelect({
  options,
  onChange = () => {},
  onEnter = () => {},
  value = '',
  placeholder = '',
  label = '',
  error = '',
  name = 'searchSelect',
  inputRef = null,
  hideError = false,
  hideLabel = false,
  showSearchIcon = false,
  className = ''
}: Props) {
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [highlightedOption, setHighlightedOption] = useState<number>(-1);

  const optionsRef = useRef<HTMLInputElement>(null);
  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef: optionsRef,
    action: onClose
  });

  useEffect(() => {
    if (filteredOptions.length !== 0) {
      addClickOutsideEvents();
    } else {
      removeClickOutsideEvents();
    }
  }, [filteredOptions, addClickOutsideEvents, removeClickOutsideEvents]);

  function onClose() {
    setFilteredOptions([]);
    onChange(selectedOption);
  }

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedOption(event.target.value);
    if (event.target.value) {
      setFilteredOptions(
        options
          .filter(option => option.includes(`${event.target.value}`))
          .sort()
      );
    } else {
      setFilteredOptions([]);
    }
  }

  function handleSelectOption(option: string) {
    onChange(option);
    setSelectedOption(option);
    setFilteredOptions([]);
    setHighlightedOption(-1);
    if (optionsRef.current) {
      const input = optionsRef.current.querySelector('input');
      if (input) {
        input.focus();
      }
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.keyCode === ARROW_DOWN_KEY_CODE) {
      e.preventDefault();
      const value =
        highlightedOption + 1 > filteredOptions.length - 1
          ? 0
          : highlightedOption + 1;
      setHighlightedOption(value);
    } else if (e.keyCode === ARROW_UP_KEY_CODE) {
      e.preventDefault();
      const value =
        highlightedOption - 1 < 0
          ? filteredOptions.length - 1
          : highlightedOption - 1;
      setHighlightedOption(value);
    } else if (e.keyCode === ENTER_KEY_CODE) {
      const option =
        highlightedOption === -1
          ? selectedOption
          : filteredOptions[highlightedOption];
      handleSelectOption(option);
      onEnter();
    } else {
      setHighlightedOption(-1);
    }
  }

  useEffect(() => {
    setSelectedOption(value || '');
  }, [value]);

  return (
    <div className={cx(className, styles.container)} ref={optionsRef}>
      {!hideLabel && <InputLabel text={label} />}
      {showSearchIcon && (
        <div className={styles.searchIcon}>
          <SearchIcon className="icon-regular" />
        </div>
      )}
      <input
        name={name}
        ref={inputRef}
        value={selectedOption}
        className={cx(styles.input, {
          [styles.showSearchIcon]: showSearchIcon
        })}
        type="text"
        placeholder={placeholder}
        onChange={handleOnChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      <ul className={styles.optionsList}>
        {filteredOptions.map((option, index) => (
          <li
            className={cx({
              [styles.isHighlighted]: index === highlightedOption
            })}
            key={`${option}-${index}`}
            onClick={() => handleSelectOption(option)}
          >
            {option}
          </li>
        ))}
      </ul>
      {!hideError && <InputError message={error} />}
    </div>
  );
}

export default SearchSelect;
