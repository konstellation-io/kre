import React, { FunctionComponent } from 'react';
import styles from './HorizontalBar.module.scss';
import cx from 'classnames';

type Props = {
  children: any;
  style?: string;
};

const HorizontalBar: FunctionComponent<Props> = ({ children, style }) => (
  <div className={cx(styles.container, style)}>{children}</div>
);

export default HorizontalBar;
