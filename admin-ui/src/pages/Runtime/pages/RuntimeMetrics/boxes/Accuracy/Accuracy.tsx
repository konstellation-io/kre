import React, { useRef, useState } from 'react';
import useRenderOnResize from '../../../../../../hooks/useRenderOnResize';

import Box from '../../components/Box/Box';
import Title from '../../components/Box/Title';
import ExpandButton from '../../components/Box/ExpandButton';
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

type Props = {
  withBgBars?: boolean;
  wrapper?: any;
};
function Accuracy({ withBgBars = false, wrapper }: Props) {
  const container = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const { width, height } = useRenderOnResize({ container });

  function toggleBoxSize(): void {
    setExpanded(!expanded);
  }

  return (
    <Box expanded={expanded} dashboardContainer={wrapper}>
      <Title text="Accuracy" />
      <ExpandButton onClick={toggleBoxSize} />
      <div className={styles.chartContainer} ref={container}>
        <BarChart
          width={width}
          height={height}
          margin={{
            top: height * 0.3,
            right: 14,
            bottom: 23,
            left: 14
          }}
          data={data}
          withBgBars={withBgBars}
        />
      </div>
    </Box>
  );
}

export default Accuracy;
