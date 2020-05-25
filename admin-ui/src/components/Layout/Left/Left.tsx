import React, { FunctionComponent, ReactElement } from 'react';
import styles from './Left.module.scss';
import cx from 'classnames';

type Props = {
  children: ReactElement | ReactElement[];
  className?: string;
};

const Left: FunctionComponent<Props> = ({ children, className }) => (
  <div className={cx(styles.container, className)}>{children}</div>
);

export default Left;
