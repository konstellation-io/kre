import React from 'react';
import HexagonPanel from '../../components/Layout/HexagonPanel/HexagonPanel';
import Hexagon from '../../components/Shape/Hexagon/Hexagon';
import * as MOCK_DATA from '../../constants/mock';
import styles from './Dashboard.module.scss';

function Dashboard() {
  const runtimes = MOCK_DATA.RUNTIMES.map((runtime, idx) => (
    <Hexagon key={`runtimeHexagon-${idx}`} {...runtime} />
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
