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
import useClickOutsideListener from '../../../hooks/useClickOutsideListener';
import cx from 'classnames';

const ARROW_UP_KEY_CODE = 38;
const ARROW_DOWN_KEY_CODE = 40;
const ENTER_KEY_CODE = 13;

type Props = {
  options: string[];
  onChange: Function;
  value: string;
  placeholder?: string;
  label?: string;
  error?: string;
};

function SearchSelect({
  options,
  onChange,
  value,
  placeholder = '',
  label = '',
  error = ''
}: Props) {
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [highlightedOption, setHighlightedOption] = useState<number>(-1);

  const containerRef = useRef<HTMLInputElement>(null);
  useClickOutsideListener({
    ref: containerRef,
    onClickOutside: () => setFilteredOptions([])
  });

  function handleOnChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedOption(event.target.value);
    onChange(event.target.value);
    if (event.target.value) {
      setFilteredOptions(
        options.filter(option => option.includes(`${event.target.value}`))
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
    } else if (e.keyCode === ENTER_KEY_CODE && highlightedOption !== -1) {
      handleSelectOption(filteredOptions[highlightedOption]);
    } else {
      setHighlightedOption(-1);
    }
  }

  useEffect(() => {
    setSelectedOption(value || '');
  }, [value]);

  return (
    <div className={styles.container} ref={containerRef}>
      <InputLabel text={label} />
      <input
        value={selectedOption}
        className={styles.input}
        type="text"
        placeholder={placeholder}
        onChange={handleOnChange}
        onKeyDown={handleKeyDown}
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
      <InputError message={error} />
    </div>
  );
}

export default SearchSelect;
