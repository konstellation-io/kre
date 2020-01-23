import React, { useRef } from 'react';
import useRenderOnResize from '../../../../../../hooks/useRenderOnResize';

import Box from '../../components/Box/Box';
import Title from '../../components/Box/Title';
import ExpandButton from '../../components/Box/ExpandButton';
import ConfusionMatrix from '../../../../../../components/Chart/ConfusionMatrix/ConfusionMatrix';

import styles from './ConfusionMatrixBox.module.scss';

const data = [
  { x: 'Repair Completed', y: 'Repair Completed', value: 95 },
  { x: 'Repair Completed', y: 'Request Completed', value: 56 },
  { x: 'Repair Completed', y: 'Disconnect Service', value: 37 },
  { x: 'Repair Completed', y: 'Confirmed Issue Resolved', value: 37 },
  { x: 'Repair Completed', y: 'Others', value: 10 },
  { x: 'Repair Completed', y: 'Plan of Feature Change Completed', value: 10 },
  { x: 'Repair Completed', y: 'Resolved By Customer', value: 10 },

  { x: 'Request Completed', y: 'Repair Completed', value: 56 },
  { x: 'Request Completed', y: 'Request Completed', value: 91 },
  { x: 'Request Completed', y: 'Disconnect Service', value: 37 },
  { x: 'Request Completed', y: 'Confirmed Issue Resolved', value: 37 },
  { x: 'Request Completed', y: 'Others', value: 10 },
  { x: 'Request Completed', y: 'Plan of Feature Change Completed', value: 10 },
  { x: 'Request Completed', y: 'Resolved By Customer', value: 10 },

  { x: 'Disconnect Service', y: 'Repair Completed', value: 37 },
  { x: 'Disconnect Service', y: 'Request Completed', value: 56 },
  { x: 'Disconnect Service', y: 'Disconnect Service', value: 88 },
  { x: 'Disconnect Service', y: 'Confirmed Issue Resolved', value: 37 },
  { x: 'Disconnect Service', y: 'Others', value: 37 },
  { x: 'Disconnect Service', y: 'Plan of Feature Change Completed', value: 10 },
  { x: 'Disconnect Service', y: 'Resolved By Customer', value: 10 },

  { x: 'Confirmed Issue Resolved', y: 'Repair Completed', value: 37 },
  { x: 'Confirmed Issue Resolved', y: 'Request Completed', value: 37 },
  { x: 'Confirmed Issue Resolved', y: 'Disconnect Service', value: 42 },
  { x: 'Confirmed Issue Resolved', y: 'Confirmed Issue Resolved', value: 78 },
  { x: 'Confirmed Issue Resolved', y: 'Others', value: 37 },
  {
    x: 'Confirmed Issue Resolved',
    y: 'Plan of Feature Change Completed',
    value: 10
  },
  { x: 'Confirmed Issue Resolved', y: 'Resolved By Customer', value: 10 },

  { x: 'Others', y: 'Repair Completed', value: 10 },
  { x: 'Others', y: 'Request Completed', value: 37 },
  { x: 'Others', y: 'Disconnect Service', value: 37 },
  { x: 'Others', y: 'Confirmed Issue Resolved', value: 42 },
  { x: 'Others', y: 'Others', value: 78 },
  { x: 'Others', y: 'Plan of Feature Change Completed', value: 42 },
  { x: 'Others', y: 'Resolved By Customer', value: 42 },

  { x: 'Plan of Feature Change Completed', y: 'Repair Completed', value: 10 },
  { x: 'Plan of Feature Change Completed', y: 'Request Completed', value: 10 },
  { x: 'Plan of Feature Change Completed', y: 'Disconnect Service', value: 37 },
  {
    x: 'Plan of Feature Change Completed',
    y: 'Confirmed Issue Resolved',
    value: 37
  },
  { x: 'Plan of Feature Change Completed', y: 'Others', value: 42 },
  {
    x: 'Plan of Feature Change Completed',
    y: 'Plan of Feature Change Completed',
    value: 76
  },
  {
    x: 'Plan of Feature Change Completed',
    y: 'Resolved By Customer',
    value: 76
  },

  { x: 'Resolved By Customer', y: 'Repair Completed', value: 10 },
  { x: 'Resolved By Customer', y: 'Request Completed', value: 10 },
  { x: 'Resolved By Customer', y: 'Disconnect Service', value: 10 },
  { x: 'Resolved By Customer', y: 'Confirmed Issue Resolved', value: 37 },
  { x: 'Resolved By Customer', y: 'Others', value: 42 },
  {
    x: 'Resolved By Customer',
    y: 'Plan of Feature Change Completed',
    value: 42
  },
  { x: 'Resolved By Customer', y: 'Resolved By Customer', value: 74 }
];

type Props = {
  wrapper?: any;
  toggleExpanded?: Function;
  nodeId?: string;
};
function ConfusionMatrixBox({ toggleExpanded, nodeId }: Props) {
  const container = useRef(null);
  const { width, height } = useRenderOnResize({ container });
  return (
    <Box>
      <Title text="Confusion Matrix" />
      <ExpandButton
        onClick={() => {
          toggleExpanded && toggleExpanded(nodeId);
        }}
      />
      <div className={styles.chartContainer} ref={container}>
        <ConfusionMatrix
          width={width}
          height={height}
          margin={{
            top: 30,
            right: 14,
            bottom: 23,
            left: 14
          }}
          data={data}
        />
      </div>
    </Box>
  );
}

export default ConfusionMatrixBox;
