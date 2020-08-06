import React, { ReactElement, useEffect, useState } from 'react';

import { GET_LOG_TABS } from 'Graphql/client/queries/getLogs.graphql';
import Header from '../../Header/Header';
import NavigationBar from '../../NavigationBar/NavigationBar';
import cx from 'classnames';
import styles from './PageBase.module.scss';
import { useQuery } from '@apollo/client';

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

  const { data: localData } = useQuery(GET_LOG_TABS);

  useEffect(() => {
    setOpened(localData?.logTabs?.length);
  }, [localData]);
  return (
    <>
      <Header>{headerChildren}</Header>
      <div
        className={cx(styles.content, customClassname, {
          [styles.withLogs]: opened
        })}
      >
        <NavigationBar />
        {children}
      </div>
    </>
  );
}

export default PageBase;
