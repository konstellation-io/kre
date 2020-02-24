import { useEffect } from 'react';

type Params = {
  ref: any;
  onClickOutside: Function;
};

export default function useClickOutsideListener({
  ref,
  onClickOutside
}: Params) {
  function handleClickOutside(event: any) {
    if (ref.current && !ref.current.contains(event.target)) {
      onClickOutside();
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
}
