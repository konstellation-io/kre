import React, { FC } from 'react';

import cx from 'classnames';
import styles from './Tag.module.scss';

export enum TagTypes {
  WARNING = 'WARNING'
}

type Props = {
  title?: string;
  type?: TagTypes;
};
const Tag: FC<Props> = ({ children, title = '', type = TagTypes.WARNING }) => (
  <span className={cx(styles.container, styles[type])} title={title}>
    {children}
  </span>
);

export default Tag;
