import { useState } from 'react';

export type InputHookElement<ValueType> = {
  value: ValueType;
  setValue: Function;
  error: string;
  setError: Function;
  clear: Function;
  clearError: Function;
  isValid: Function;
  onChange: (newValue: ValueType) => void;
};

export default function useInput<ValueType>(
  initialValue: ValueType,
  validator: Function
) {
  const [value, setValue] = useState<ValueType>(initialValue);
  const [error, setError] = useState<string>('');

  return {
    value,
    setValue,
    error,
    setError,
    clear: () => setValue(initialValue),
    clearError: () => setError(''),
    isValid: () => {
      const err = validator(value);
      if (err) {
        setError(err);
      }

      return !err;
    },
    onChange: (newValue: ValueType) => {
      setValue(newValue);
      setError('');
    }
  } as InputHookElement<ValueType>;
}
