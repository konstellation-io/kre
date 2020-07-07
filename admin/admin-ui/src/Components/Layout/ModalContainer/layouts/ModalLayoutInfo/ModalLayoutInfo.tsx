import React, { FC } from 'react';

import cx from 'classnames';
import styles from './ModalLayoutInfo.module.scss';

type Props = {
  children: string | JSX.Element;
  className?: string;
};
const ModalLayoutInfo: FC<Props> = ({ children, className = '' }) => (
  <div className={cx(className, styles.message)} data-testid="modal-message">
    {children}
  </div>
);

export default ModalLayoutInfo;
