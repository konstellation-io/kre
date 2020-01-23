import React, { useRef } from 'react';
import useRenderOnResize from '../../../../../../hooks/useRenderOnResize';

import Box from '../../components/Box/Box';
import Title from '../../components/Box/Title';
import ExpandButton from '../../components/Box/ExpandButton';
import BarChartSeries from '../../../../../../components/Chart/BarChartSeries/BarChartSeries';

import styles from './LabelStats.module.scss';

const data = [
  {
    title: 'Accuracy',
    data: [
      { y: 'Repair Completed', x: 40 },
      { y: 'Request Completed', x: 45 },
      { y: 'Disconnect Service', x: 52 },
      { y: 'Confirmed Issue Resolved', x: 32 },
      { y: 'Others', x: 60 },
      { y: 'Plan of Feature Change Completed', x: 72 },
      { y: 'Resolved By Customer', x: 50 }
    ]
  },
  {
    title: 'Recall',
    data: [
      { y: 'Repair Completed', x: 80 },
      { y: 'Request Completed', x: 25 },
      { y: 'Disconnect Service', x: 12 },
      { y: 'Confirmed Issue Resolved', x: 62 },
      { y: 'Others', x: 70 },
      { y: 'Plan of Feature Change Completed', x: 72 },
      { y: 'Resolved By Customer', x: 30 }
    ]
  },
  {
    title: 'Support',
    data: [
      { y: 'Repair Completed', x: 20 },
      { y: 'Request Completed', x: 25 },
      { y: 'Disconnect Service', x: 12 },
      { y: 'Confirmed Issue Resolved', x: 22 },
      { y: 'Others', x: 50 },
      { y: 'Plan of Feature Change Completed', x: 50 },
      { y: 'Resolved By Customer', x: 10 }
    ]
  }
];

type Props = {
  withBgBars?: boolean;
  wrapper?: any;
  toggleExpanded?: Function;
  nodeId?: string;
};
function LabelStats({ withBgBars = false, toggleExpanded, nodeId }: Props) {
  const container = useRef(null);
  const { width, height } = useRenderOnResize({ container });
  return (
    <Box>
      <Title text="Label Stats" />
      <ExpandButton
        onClick={() => {
          toggleExpanded && toggleExpanded(nodeId);
        }}
      />
      <div className={styles.chartContainer} ref={container}>
        <BarChartSeries
          width={width}
          height={height}
          margin={{
            top: 23,
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

export default LabelStats;
