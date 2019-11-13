import React, { useState } from 'react';

import HorizontalBar from '../Layout/HorizontalBar/HorizontalBar';
import Button from '../Button/Button';

import styles from './Modal.module.scss';

type Props = {
  title: String;
  message: String;
};

function Modal({}: Props) {
  const [isVisible, setIsVisible] = useState(true);

  function onCalcelClick() {
    setIsVisible(false);
  }

  return <div className={styles.container}></div>;
}

export default Modal;
