import React, { ReactElement, useEffect, useState } from 'react';
import Header from '../../Header/Header';
import cx from 'classnames';
import styles from './PageBase.module.scss';
import { useReactiveVar } from '@apollo/client';
import { logTabs } from '../../../Graphql/client/cache';

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
  const [opened, setOpened] = useState<boolean>(false);

  const dataLogTabs = useReactiveVar(logTabs);

  useEffect(() => {
    setOpened(!!dataLogTabs.length);
  }, [dataLogTabs]);

  return (
    <>
      <Header>{headerChildren}</Header>
      <div
        className={cx(styles.content, customClassname, {
          [styles.withLogs]: opened
        })}
      >
        {children}
      </div>
    </>
  );
}

export default PageBase;
