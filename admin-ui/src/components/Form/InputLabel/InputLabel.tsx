import React from 'react';
import styles from './InputLabel.module.scss';

type Props = {
  text?: string;
};

function InputLabel({ text = '' }: Props) {
  return (
    <label className={styles.label} data-testid="label">
      {text.toUpperCase()}
    </label>
  );
}

export default InputLabel;
