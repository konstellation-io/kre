import React from 'react';
import cx from 'classnames';
import styles from './Charts.module.scss';
import { RowsWrapper, Row } from 'react-grid-resizable';
import GeneralInfo from '../../boxes/GeneralInfo/GeneralInfo';
import ConfusionMatrixBox from '../../boxes/ConfusionMatrixBox/ConfusionMatrixBox';
import LabelStats from '../../boxes/LabelStats/LabelStats';
import Accuracy from '../../boxes/Accuracy/Accuracy';
import { GetMetrics } from '../../../../../../graphql/queries/types/GetMetrics';

type Props = {
  data: GetMetrics;
  expanded: string;
  toggleExpanded: Function;
};

function Charts({ data, expanded, toggleExpanded }: Props) {
  function getNodesToExpand() {
    const nodes = [expanded];
    let act = expanded;

    while (act.length > 0) {
      act = act.slice(0, -2);
      nodes.push(act);
    }

    return nodes;
  }

  const minimize = {
    [styles.minimize]: expanded
  };

  const nodesToExpand = getNodesToExpand();

  const height = expanded ? window.innerHeight - 164 : '100%';
  const width = window.innerWidth - 310;

  const SuccessFailsHeight = width / 4;

  const nLabels = Math.sqrt(data.metrics.charts.confusionMatrix.length);
  const confusionMatrixHeight = nLabels * 100;
  const SeriesHeight = nLabels * 100;

  const separatorRowProps = { className: styles.separatorRow };

  const series = {
    Accuracy: data.metrics.charts.seriesAccuracy,
    Recall: data.metrics.charts.seriesRecall,
    Support: data.metrics.charts.seriesSupport
  };

  return (
    <div className={styles.content}>
      <div
        className={cx(styles.wrapper, {
          [styles.expanded]: expanded
        })}
        style={{ height }}
      >
        <RowsWrapper separatorProps={separatorRowProps}>
          <Row
            initialHeight={165}
            style={{
              maxHeight: '165px'
            }}
            className={cx(styles.row, minimize, {
              [styles.maximize]: nodesToExpand.includes('r1')
            })}
            disabled
          >
            <GeneralInfo data={data.metrics.values} />
          </Row>
          <Row
            initialHeight={confusionMatrixHeight}
            style={{
              maxHeight: `${confusionMatrixHeight * 1.33}px`,
              marginTop: '10px'
            }}
            className={cx(styles.row, minimize, {
              [styles.maximize]: nodesToExpand.includes('r2')
            })}
            top={false}
          >
            <ConfusionMatrixBox
              toggleExpanded={toggleExpanded}
              nodeId={'r2'}
              data={data.metrics.charts.confusionMatrix}
            />
          </Row>
          <Row
            initialHeight={SeriesHeight}
            className={cx(styles.row, minimize, {
              [styles.maximize]: nodesToExpand.includes('r3')
            })}
            style={{ maxHeight: 277 + 590 - 160 }}
          >
            <LabelStats
              toggleExpanded={toggleExpanded}
              nodeId={'r3'}
              data={series}
            />
          </Row>
          <Row
            initialHeight={SuccessFailsHeight}
            className={cx(styles.row, minimize, {
              [styles.maximize]: nodesToExpand.includes('r4')
            })}
            style={{ maxHeight: 277 + 590 - 160 }}
          >
            <Accuracy
              toggleExpanded={toggleExpanded}
              nodeId={'r4'}
              data={data.metrics.charts.successVsFails}
            />
          </Row>
        </RowsWrapper>
      </div>
    </div>
  );
}

export default Charts;
