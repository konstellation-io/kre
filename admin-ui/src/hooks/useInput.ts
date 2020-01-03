import { useState } from 'react';

export type InputHookElement = {
  value: any;
  setValue: Function;
  error: string;
  setError: Function;
  clear: Function;
  clearError: Function;
  isValid: Function;
  onChange: Function;
};

export default function useInput(initialValue: any, validator: Function) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

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
    onChange: (newValue: any) => {
      setValue(newValue);
      setError('');
    }
  } as InputHookElement;
}
