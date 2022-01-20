import { Row, RowsWrapper } from 'react-grid-resizable';

import Accuracy from '../../boxes/Accuracy/Accuracy';
import ConfusionMatrixBox from '../../boxes/ConfusionMatrixBox/ConfusionMatrixBox';
import GeneralInfo from '../../boxes/GeneralInfo/GeneralInfo';
import { GetMetrics } from 'Graphql/queries/types/GetMetrics';
import { INFO } from './infoTexts';
import LabelStats from '../../boxes/LabelStats/LabelStats';
import React from 'react';
import cx from 'classnames';
import { get } from 'lodash';
import styles from './Charts.module.scss';

const PADDING_HEIGHT = 164;
const PADDING_WIDTH = 310;
const MIN_HEIGHT_CONFUSION_MATRIX = 400;

type Props = {
  data: GetMetrics;
  expanded: string;
  toggleExpanded: Function;
  viewAllData: boolean;
};

function Charts({ data, expanded, toggleExpanded, viewAllData }: Props) {
  if (data.metrics === null) {
    return null;
  }

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

  const height = expanded ? window.innerHeight - PADDING_HEIGHT : '100%';
  const width = get(window, 'innerWidth', 0) - PADDING_WIDTH;

  const SuccessFailsHeight = width / 3;

  const nLabels = Math.sqrt(data.metrics.charts.confusionMatrix.length);
  const confusionMatrixHeight = Math.max(
    MIN_HEIGHT_CONFUSION_MATRIX,
    nLabels * 100
  );
  const SeriesHeight = nLabels * 100;

  const separatorRowProps = { className: styles.separatorRow };

  const series = {
    Accuracy: data.metrics.charts.seriesAccuracy,
    Recall: data.metrics.charts.seriesRecall,
    Support: data.metrics.charts.seriesSupport
  };

  return (
    <div className={styles.content} data-testid='metricsPanel'>
      <div
        className={cx(styles.wrapper, {
          [styles.expanded]: expanded
        })}
        style={{ height }}
      >
        <div className={styles.modal} />
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
            <GeneralInfo data={data.metrics.values} info={INFO.GENERAL} />
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
              expanded={nodesToExpand.includes('r2')}
              info={INFO.CONFUSION_MATRIX}
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
              viewAllData={viewAllData}
              info={INFO.ACCURACY_RECALL_SUPPORT}
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
              viewAllData={viewAllData}
            />
          </Row>
        </RowsWrapper>
      </div>
    </div>
  );
}

export default Charts;
