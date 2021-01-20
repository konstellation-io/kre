import { Button } from 'kwc';
import IconCopy from '@material-ui/icons/FileCopy';
import React from 'react';
import { copyToClipboard } from 'Utils/clipboard';
import styles from './EntrypointTooltipContent.module.scss';

type InputProps = {
  entrypointAddress: string;
};
export function EntrypointTooltipContent({ entrypointAddress }: InputProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.address}>{entrypointAddress}</span>
      <Button
        label=""
        onClick={() => copyToClipboard(entrypointAddress)}
        Icon={IconCopy}
        className={styles.copyButton}
      />
    </div>
  );
}
