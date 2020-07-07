import React from 'react';
import cx from 'classnames';
import styles from './InputLabel.module.scss';

type Props = {
  text?: string;
  hidden?: boolean;
};

function InputLabel({ text = '', hidden = false }: Props) {
  return (
    <label
      className={cx(styles.label, { [styles.hidden]: hidden })}
      data-testid="label"
    >
      {text.toUpperCase()}
    </label>
  );
}

export default InputLabel;
