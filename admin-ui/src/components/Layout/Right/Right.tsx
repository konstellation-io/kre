import React, { FunctionComponent, ReactElement } from 'react';
import styles from './Right.module.scss';
import cx from 'classnames';

type Props = {
  children: ReactElement | (ReactElement | false)[];
  className?: string;
};

const Right: FunctionComponent<Props> = ({ children, className }) => (
  <div className={cx(styles.container, className)}>{children}</div>
);

export default Right;
