import React, {useState} from 'react';

import HorizontalBar from '../Layout/HorizontalBar/HorizontalBar';
import Button from '../Button/Button';

import cx from 'classnames';
import styles from './Modal.module.scss';


type Props = {
  title: String;
  message: String;
};

function Modal({title, message}: Props) {
  const [isVisible, setIsVisible] = useState(true);

  function onCancelClick() {
    setIsVisible(false);
  }

  return (
    <div className={cx(styles.container, {
      [styles.visible]: isVisible
    })}>
      <div className={styles.title}>{title}</div>
      <div className={styles.message}>{message}</div>
      <HorizontalBar>
        <Button
          label={'NEW VERSION'}
          to='/'
        />
        <Button
          label={'CANCEL'}
          onClick={onCancelClick}
        />
      </HorizontalBar>
    </div>
  );
}

export default Modal;
