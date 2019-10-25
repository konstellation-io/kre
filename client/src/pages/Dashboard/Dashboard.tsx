import React from 'react';
import HexagonPanel from '../../components/Layout/HexagonPanel/HexagonPanel';
import Hexagon from '../../components/Shape/Hexagon/Hexagon';
import Spinner from '../../components/Spinner/Spinner';
import { formatRuntime } from './dataModel';
import styles from './Dashboard.module.scss';

import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const GET_RUNTIMES = gql`
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
  if (loading) return <Spinner />;
  if (error) return <p>ERROR</p>;

  const runtimes = data.runtimes.map((runtime:any, idx:number) => (
    <Hexagon
      key={`runtimeHexagon-${idx}`}
      {...formatRuntime(runtime)}
    />
  ));

  return (
    <div className={styles.container} data-testid="dashboardContainer">
      <div className={styles.hexagons}>
        <HexagonPanel>{runtimes}</HexagonPanel>
      </div>
    </div>
  );
}

export default Dashboard;
