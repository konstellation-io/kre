import { get, sortBy } from 'lodash';
import React, { useState, useRef, useEffect } from 'react';
import { VersionRouteParams } from '../../../../../../constants/routes';
import { useQuery } from '@apollo/react-hooks';
import { loader } from 'graphql.macro';
import {
  GetResourceMetrics,
  GetResourceMetrics_resourceMetrics,
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

type ChartData = {
  cpu: D[];
  mem: D[];
};

const N_MINUTES_TO_SHOW = 15;

function buildDElement(date: string, value: number): D {
  return {
    x: new Date(date),
    y: value
  };
}

function ResourceMetrics() {
  const [expanded, setExpanded] = useState(false);
  const { versionId } = useParams<VersionRouteParams>();
  const [fromDate] = useState<Moment>(
    moment().subtract(N_MINUTES_TO_SHOW, 'minute')
  );
  const toDate = useRef<Moment>(moment());
  const [chartData, setChartData] = useState<ChartData>({ cpu: [], mem: [] });
  const nMetricsToRemove = useRef(0);
  const unsubscribe = useRef<Function | null>(null);

  const { data, error, loading, subscribeToMore } = useQuery<
    GetResourceMetrics,
    GetResourceMetricsVariables
  >(GetResourceMetricsQuery, {
    variables: {
      versionId,
      fromDate: fromDate.toISOString(),
      toDate: toDate.current.toISOString()
    },
    onCompleted: () => (unsubscribe.current = subscribe()),
    onError: () => unsubscribe.current && unsubscribe.current()
  });

  useEffect(() => {
    return () => unsubscribe.current && unsubscribe.current();
  }, [unsubscribe]);

  function removeOutsideRangeData(
    allData: GetResourceMetrics_resourceMetrics[]
  ) {
    nMetricsToRemove.current = Math.max(0, allData.length - N_MINUTES_TO_SHOW);
    return allData.splice(nMetricsToRemove.current);
  }

  const subscribe = () =>
    subscribeToMore({
      document: WatchResourceMetricsSubscription,
      variables: { versionId, fromDate: toDate.current.toISOString() },
      updateQuery: (prev, { subscriptionData }) => {
        const newResourceMetrics = get(
          subscriptionData.data,
          'watchResourceMetrics'
        );

        let newMetrics = [...prev.resourceMetrics].concat(newResourceMetrics);
        newMetrics = removeOutsideRangeData(newMetrics);

        return {
          resourceMetrics: sortBy(newMetrics, 'date')
        };
      }
    });

  useEffect(() => {
    if (data) {
      const newChartData: ChartData = { cpu: [], mem: [] };

      data.resourceMetrics.forEach(d => {
        newChartData.cpu.push(buildDElement(d.date, d.cpu));
        newChartData.mem.push(buildDElement(d.date, d.mem));
      });

      setChartData(newChartData);
    }
  }, [data]);

  function toggleExpand() {
    setExpanded(!expanded);
  }

  if (loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  return (
    <div className={cx(styles.container, { [styles.expanded]: expanded })}>
      {chartData.cpu.length !== 0 && (
        <>
          <div className={styles.chart}>
            <TimeSeriesChart
              title="CPU"
              color={COLORS.HIGHLIGHT}
              data={chartData.cpu}
              unit="Cores"
              expanded={expanded}
              toggleExpand={toggleExpand}
              formatYAxis={v => format('.3s')(v)}
              formatXAxis={date => formatDate(new Date(date), true)}
              removed={nMetricsToRemove.current}
              highlightLastValue
            />
          </div>
          <div className={styles.chart}>
            <TimeSeriesChart
              title="RAM"
              color={COLORS.ALERT}
              data={chartData.mem}
              unit="B"
              expanded={expanded}
              toggleExpand={toggleExpand}
              formatYAxis={v => format('.3s')(v)}
              formatXAxis={date => formatDate(new Date(date), true)}
              removed={nMetricsToRemove.current}
              highlightLastValue
            />
          </div>
        </>
      )}
    </div>
  );
}

export default ResourceMetrics;
