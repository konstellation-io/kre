import { get, sortBy } from 'lodash';
import React, { useState, useRef } from 'react';
import { VersionRouteParams } from '../../../../../../constants/routes';
import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import {
  GetResourceMetrics,
  GetResourceMetricsVariables
} from '../../../../../../graphql/queries/types/GetResourceMetrics';
import { useParams } from 'react-router';
import TimeSeriesChart, { D } from '../TimeSeriesChart/TimeSeriesChart';
import moment, { Moment } from 'moment';
import styles from './ResourceMetrics.module.scss';
import * as COLORS from '../../../../../../constants/colors';
import cx from 'classnames';
import SpinnerCircular from '../../../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../../../components/ErrorMessage/ErrorMessage';
import { format } from 'd3-format';
import { formatDate } from '../../../../../../utils/format';

const WatchResourceMetricsSubscription = loader(
  '../../../../../../graphql/subscriptions/watchResourceMetrics.graphql'
);
const GetResourceMetricsQuery = loader(
  '../../../../../../graphql/queries/getResourceMetrics.graphql'
);

const MAX_DATA_ELEMENTS = 60;

function ResourceMetrics() {
  const [expanded, setExpanded] = useState(false);
  const { versionId } = useParams<VersionRouteParams>();
  const [fromDate] = useState<Moment>(moment().startOf('hour'));
  const toDate = useRef<Moment>(moment());

  const { data, error, loading, subscribeToMore } = useQuery<
    GetResourceMetrics,
    GetResourceMetricsVariables
  >(GetResourceMetricsQuery, {
    variables: {
      versionId,
      fromDate: fromDate.toISOString(),
      toDate: toDate.current.toISOString()
    },
    onCompleted: data => subscribe()
  });

  const subscribe = () =>
    subscribeToMore({
      document: WatchResourceMetricsSubscription,
      variables: { versionId, fromDate: toDate.current.toISOString() },
      updateQuery: (prev, { subscriptionData }) => {
        const newResourceMetric = get(
          subscriptionData.data,
          'watchResourceMetrics'
        );

        let newMetrics = [...prev.resourceMetrics];

        // const nMetricsToRemove = newMetrics.length - MAX_DATA_ELEMENTS;
        // if (nMetricsToRemove > 0) {
        //   newMetrics = newMetrics.splice(nMetricsToRemove);
        // }

        newMetrics = newMetrics.concat(newResourceMetric);

        return {
          resourceMetrics: sortBy(newMetrics, 'date')
        };
      }
    });

  function toggleExpand() {
    setExpanded(!expanded);
  }

  const cpuData: D[] = [],
    memData: D[] = [];

  if (data) {
    // const nMetricsToRemove = data.resourceMetrics.length - MAX_DATA_ELEMENTS;
    data.resourceMetrics.forEach((d, i) => {
      // const removeDataElement = i < nMetricsToRemove;

      cpuData.push({
        x: new Date(d.date),
        y: d.cpu
      });
      memData.push({
        x: new Date(d.date),
        y: d.mem
      });
    });
  }

  if (loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  return (
    <div className={cx(styles.container, { [styles.expanded]: expanded })}>
      {data && data.resourceMetrics.length !== 0 && (
        <>
          <div className={styles.chart}>
            <TimeSeriesChart
              title="CPU"
              nMaxElements={MAX_DATA_ELEMENTS}
              color={COLORS.HIGHLIGHT}
              data={cpuData}
              unit="Cores"
              expanded={expanded}
              toggleExpand={toggleExpand}
              formatYAxis={v => format('.0s')(v)}
              formatXAxis={date => formatDate(new Date(date), true)}
              highlightLastValue
            />
          </div>
          <div className={styles.chart}>
            <TimeSeriesChart
              title="RAM"
              nMaxElements={MAX_DATA_ELEMENTS}
              color={COLORS.ALERT}
              data={memData}
              unit="B"
              expanded={expanded}
              toggleExpand={toggleExpand}
              formatYAxis={v => format('.0s')(v)}
              formatXAxis={date => formatDate(new Date(date), true)}
              highlightLastValue
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ResourceMetrics;
