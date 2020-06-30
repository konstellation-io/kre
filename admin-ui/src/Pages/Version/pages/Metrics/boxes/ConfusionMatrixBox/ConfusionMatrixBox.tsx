import ConfusionMatrix, {
  D
} from 'Components/Chart/ConfusionMatrix/ConfusionMatrix';
import React, { useRef } from 'react';

import Box from '../../components/Box/Box';
import ExpandButton from '../../components/Box/ExpandButton';
import { GetMetrics_metrics_charts_confusionMatrix } from 'Graphql/queries/types/GetMetrics';
import Title from '../../components/Box/Title';
import styles from './ConfusionMatrixBox.module.scss';
import useRenderOnResize from 'Hooks/useRenderOnResize';

function formatData(data: GetMetrics_metrics_charts_confusionMatrix[]): D[] {
  return data.map((d: GetMetrics_metrics_charts_confusionMatrix) => ({
    x: d.x,
    y: d.y,
    value: parseInt(d.z || '0')
  }));
}

type Props = {
  toggleExpanded?: Function;
  nodeId?: string;
  data: GetMetrics_metrics_charts_confusionMatrix[];
};
function ConfusionMatrixBox({ toggleExpanded, nodeId, data }: Props) {
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
          data={formatData(data)}
        />
      </div>
    </Box>
  );
}

export default ConfusionMatrixBox;
