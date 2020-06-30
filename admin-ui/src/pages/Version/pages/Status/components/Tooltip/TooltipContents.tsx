import React, { useRef } from 'react';

import Button from '../../../../../../components/Button/Button';
import IconCopy from '@material-ui/icons/FileCopy';
import cx from 'classnames';
import styles from './Tooltip.module.scss';

export enum NodeTypes {
  INPUT,
  OUTPUT,
  INNER
}

type InputProps = {
  nodeType: NodeTypes;
};
export function InputElContent({ nodeType }: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const url = 'https://www.dafdsafsads.com/a263r5436254/';

  function onCopyToClipboard() {
    if (inputRef.current !== null) {
      inputRef.current.select();
      inputRef.current.setSelectionRange(0, 99999);

      document.execCommand('copy');
    }
  }

  return (
    <div className={cx(styles.tooltipContent, styles[nodeType])}>
      <span>HTTPS</span>
      <input type="text" value={url} ref={inputRef} readOnly />
      <Button
        label=""
        onClick={onCopyToClipboard}
        Icon={IconCopy}
        className={styles.copyButton}
      />
    </div>
  );
}
