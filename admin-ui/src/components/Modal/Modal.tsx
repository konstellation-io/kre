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
  blocking?: boolean;
  onAccept?: Function;
  onClose?: Function | null;
};

function Modal({
  title,
  message,
  actionButtonLabel,
  to = '',
  blocking = false,
  onAccept = function() {},
  onClose = null
}: Props) {
  const [isVisible, setIsVisible] = useState(true);

  function onCancelClick() {
    if (onClose) onClose();
    else setIsVisible(false);
  }

  return (
    <>
      {blocking && <div className={styles.bg} />}
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
            onClick={onAccept}
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
    </>
  );
}

export default Modal;
