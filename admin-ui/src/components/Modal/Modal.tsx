import React, { useState } from 'react';

import HorizontalBar from '../Layout/HorizontalBar/HorizontalBar';
import Button from '../Button/Button';

import cx from 'classnames';
import styles from './Modal.module.scss';

type Props = {
  title: string;
  message: string;
  actionButtonLabel: string;
  to?: string;
};

function Modal({ title, message, actionButtonLabel, to = '/' }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  function onCancelClick() {
    setIsVisible(false);
  }

  return (
    <div
      className={cx(styles.container, {
        [styles.visible]: isVisible
      })}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.message}>{message}</div>
      <HorizontalBar>
        <Button
          primary
          label={actionButtonLabel}
          to={to}
          height={30}
          style={{ width: '122px', padding: '0 0' }}
        />
        <Button
          label={'CANCEL'}
          onClick={onCancelClick}
          height={30}
          style={{ width: '122px', padding: '0 0' }}
        />
      </HorizontalBar>
    </div>
  );
}

export default Modal;
