import React from 'react';
import cx from 'classnames';
import styles from './InputError.module.scss';

type Props = {
  message?: string;
};

function InputError({ message = '' }: Props) {
  return (
    <div
      className={cx(styles.errorMessage, { [styles.show]: message !== '' })}
      data-testid="error-message"
    >
      {message}
    </div>
  );
}

export default InputError;
