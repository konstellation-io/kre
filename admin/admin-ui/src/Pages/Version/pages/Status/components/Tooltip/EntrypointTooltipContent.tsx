import React, { useRef } from 'react';

import { Button } from 'kwc';
import IconCopy from '@material-ui/icons/FileCopy';
import styles from './EntrypointTooltipContent.module.scss';

type InputProps = {
  entrypointAddress: string;
};
export function EntrypointTooltipContent({ entrypointAddress }: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function onCopyToClipboard() {
    if (inputRef.current !== null) {
      inputRef.current.select();
      inputRef.current.setSelectionRange(0, 99999);

      document.execCommand('copy');
    }
  }

  return (
    <div className={styles.wrapper}>
      <input type="text" value={entrypointAddress} ref={inputRef} readOnly />
      <Button
        label=""
        onClick={onCopyToClipboard}
        Icon={IconCopy}
        className={styles.copyButton}
      />
    </div>
  );
}
