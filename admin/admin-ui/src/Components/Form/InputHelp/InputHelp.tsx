import React from 'react';
import cx from 'classnames';
import styles from './InputHelp.module.scss';

type Props = {
  message?: string;
};

function InputHelp({ message = '' }: Props) {
  return (
    <div
      className={cx(styles.helpMessage, { [styles.show]: message !== '' })}
      data-testid="help-message"
    >
      {message}
    </div>
  );
}

export default InputHelp;
