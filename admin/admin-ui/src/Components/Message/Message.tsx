import React from 'react';
import styles from './Message.module.scss';

type Props = {
  text: string;
};

function Message({ text }: Props) {
  return <div className={styles.container}>{text}</div>;
}

export default Message;
