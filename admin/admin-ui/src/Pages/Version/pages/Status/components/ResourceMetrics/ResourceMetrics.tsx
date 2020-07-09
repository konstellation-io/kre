import * as COLORS from 'Constants/colors';

import {
  GetResourceMetrics,
  GetResourceMetricsVariables,
  GetResourceMetrics_resourceMetrics
} from 'Graphql/queries/types/GetResourceMetrics';
import React, { useEffect, useRef, useState } from 'react';
import TimeSeriesChart, { D } from '../TimeSeriesChart/TimeSeriesChart';
import { get, sortBy } from 'lodash';
import moment, { Moment } from 'moment';

import ErrorMessage from 'Components/ErrorMessage/ErrorMessage';
import Message from 'Components/Message/Message';
import SpinnerCircular from 'Components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import { VersionRouteParams } from 'Constants/routes';
import { WatchResourceMetrics } from 'Graphql/subscriptions/types/WatchResourceMetrics';
import cx from 'classnames';
import { format } from 'd3-format';
import { formatDate } from 'Utils/format';
import { loader } from 'graphql.macro';
import styles from './ResourceMetrics.module.scss';
import { useParams } from 'react-router';
import { useQuery } from '@apollo/react-hooks';

const WatchResourceMetricsSubscription = loader(
  'Graphql/subscriptions/watchResourceMetrics.graphql'
);
const GetResourceMetricsQuery = loader(
  'Graphql/queries/getResourceMetrics.graphql'
);

type SubscriptionData = {
  subscriptionData: {
    data: WatchResourceMetrics;
  };
};

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
      updateQuery: (prev, { subscriptionData }: SubscriptionData) => {
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

  if (chartData.cpu.length <= 1)
    return (
      <div className={styles.container}>
        <div className={styles.notEnoughtData}>
          Not enought data to represent resource metrics
        </div>
      </div>
    );

  return (
    <div className={cx(styles.container, { [styles.expanded]: expanded })}>
      <div className={styles.chart}>
        <TimeSeriesChart
          title="CPU"
          color={COLORS.HIGHLIGHT}
          data={chartData.cpu}
          unit="mCores"
          expanded={expanded}
          toggleExpand={toggleExpand}
          formatYAxis={v => format('.4')(v)}
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
    </div>
  );
}

export default ResourceMetrics;
