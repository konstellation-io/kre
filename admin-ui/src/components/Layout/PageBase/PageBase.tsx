import React from 'react';
import styles from './PageBase.module.scss';
import Header from '../../Header/Header';
import NavigationBar from '../../NavigationBar/NavigationBar';

type PageBaseProps = {
  children: any;
  headerChildren?: any;
  customContentStyles?: object;
};

function PageBase({
  children,
  headerChildren,
  customContentStyles
}: PageBaseProps) {
  return (
    <>
      <Header>{headerChildren}</Header>
      <div className={styles.content} style={customContentStyles}>
        <NavigationBar />
        {children}
      </div>
    </>
  );
}

export default PageBase;
