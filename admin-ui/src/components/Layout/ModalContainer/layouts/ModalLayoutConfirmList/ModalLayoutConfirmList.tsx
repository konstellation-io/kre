import React, { FC } from 'react';

import styles from './ModalLayoutConfirmList.module.scss';

type Props = {
  children: JSX.Element[];
  message: string;
  confirmMessage: string;
};
const ModalLayoutConfirmList: FC<Props> = ({
  children,
  message,
  confirmMessage
}) => (
  <>
    <div className={styles.message}>{message}</div>
    <div className={styles.list}>{children}</div>
    <div className={styles.confirmMessage}>{confirmMessage}</div>
  </>
);

export default ModalLayoutConfirmList;
