import React, { ReactElement } from 'react';
import styles from './PageBase.module.scss';
import Header from '../../Header/Header';
import NavigationBar from '../../NavigationBar/NavigationBar';
import cx from 'classnames';

type PageBaseProps = {
  children: ReactElement | ReactElement[] | null;
  headerChildren?: ReactElement | ReactElement[] | null;
  customClassname?: string;
};

function PageBase({
  children,
  headerChildren,
  customClassname
}: PageBaseProps) {
  return (
    <>
      <Header>{headerChildren}</Header>
      <div className={cx(styles.content, customClassname)}>
        <NavigationBar />
        {children}
      </div>
    </>
  );
}

export default PageBase;
