import React, { FunctionComponent, ReactElement } from 'react';
import styles from './Left.module.scss';
import cx from 'classnames';

type Props = {
  children: ReactElement | ReactElement[];
  style?: string;
};

const Left: FunctionComponent<Props> = ({ children, style }) => (
  <div className={cx(styles.container, style)}>{children}</div>
);

export default Left;
