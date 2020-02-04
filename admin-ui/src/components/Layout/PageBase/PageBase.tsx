import React from 'react';
import styles from './PageBase.module.scss';
import Header from '../../Header/Header';
import NavigationBar from '../../NavigationBar/NavigationBar';

type PageBaseProps = {
  children: any;
};

function PageBase({ children }: PageBaseProps) {
  return (
    <>
      <Header />
      <div className={styles.content}>
        <NavigationBar />
        {children}
      </div>
    </>
  );
}

export default PageBase;
