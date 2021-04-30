import React, { FC } from 'react';
import cx from 'classnames';
import styles from './VersionInfo.module.scss';

type Props = {
  title: string;
  children: JSX.Element;
  className?: string;
};
const InfoField: FC<Props> = ({ title, children, className = '' }) => (
  <div className={cx(styles.infoField, className)}>
    <p className={styles.infoFieldTitle}>{title}</p>
    <div className={styles.infoFieldBody}>{children}</div>
  </div>
);

export default InfoField;
