import React, { FunctionComponent, ReactElement } from 'react';
import styles from './Right.module.scss';
import cx from 'classnames';

type Props = {
  children: ReactElement | ReactElement[];
  style?: string;
};

const Right: FunctionComponent<Props> = ({ children, style }) => (
  <div className={cx(styles.container, style)}>{children}</div>
);

export default Right;
