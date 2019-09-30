import {useState} from 'react';

export default function useInput(initialValue:any, validator:Function) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  return {
    value,
    setValue,
    error,
    clear: () => setValue(initialValue),
    clearError: () => setError(''),
    isValid: () => {
      const error = validator(value);
      if (error) {
        setError(error);
      }

      return !error;
    },
    onChange: (newValue:any) => {
      setValue(newValue);
      setError('');
    }
  };
};
