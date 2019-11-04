import React from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import HexagonPanel from '../../components/Layout/HexagonPanel/HexagonPanel';
import Hexagon from '../../components/Shape/Hexagon/Hexagon';
import Spinner from '../../components/Spinner/Spinner';
import { formatRuntime } from './dataModel';
import styles from './Dashboard.module.scss';

import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

export const GET_RUNTIMES = gql`
  query GetRuntimes {
    runtimes {
      id
      name
      status
      creationDate
    }
  }
`;

function Dashboard() {
  const { data, loading, error } = useQuery(GET_RUNTIMES);

  function getContent() {
    if (error) return <p>ERROR</p>;
    if (loading) return <Spinner />;

    const runtimes = data.runtimes.map((runtime:any, idx:number) => (
      <Hexagon
        key={`runtimeHexagon-${idx}`}
        {...formatRuntime(runtime)}
      />
    ));

    return <HexagonPanel>{runtimes}</HexagonPanel>;
  }

  return (
    <div className={styles.container} data-testid="dashboardContainer">
      <NavigationBar />
      <div className={styles.content}>
        <div className={styles.hexagons}>
          { getContent() }
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
