import React, { useRef } from 'react';
import useRenderOnResize from '../../../../../../hooks/useRenderOnResize';

import Box from '../../components/Box/Box';
import Title from '../../components/Box/Title';
import BarChart from '../../../../../../components/Chart/BarChart/BarChart';

import styles from './Accuracy.module.scss';

const data = [
  {
    x: 'Repair Completed',
    y: 40
  },
  {
    x: 'Request Completed',
    y: 45
  },
  {
    x: 'Disconnect Service',
    y: 52
  },
  {
    x: 'Confirmed Issue Resolved',
    y: 32
  },
  {
    x: 'Others',
    y: 60
  },
  {
    x: 'Plan of Feature Change Completed',
    y: 72
  },
  {
    x: 'Resolved By Customer',
    y: 50
  }
];

function Accuracy() {
  const container = useRef(null);
  const { width, height } = useRenderOnResize({ container });

  return (
    <Box>
      <Title text="Accuracy" />
      <div className={styles.chartContainer} ref={container}>
        <BarChart
          width={width}
          height={height}
          margin={{
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }}
          data={data}
        />
      </div>
    </Box>
  );
}

export default Accuracy;
