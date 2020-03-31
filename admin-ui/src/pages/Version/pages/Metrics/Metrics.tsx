import React, { useEffect, useState, useCallback } from 'react';
import DashboardTitle from './components/DashboardTitle/DashboardTitle';
import Charts from './components/Charts/Charts';
import Message from '../../../../components/Message/Message';
import { loader } from 'graphql.macro';
import styles from './Metrics.module.scss';
import {
  GetVersionConfStatus_versions,
  GetVersionConfStatus_runtime
} from '../../../../graphql/queries/types/GetVersionConfStatus';
import { useQuery } from '@apollo/react-hooks';
import {
  GetMetrics,
  GetMetricsVariables
} from '../../../../graphql/queries/types/GetMetrics';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import { useParams } from 'react-router-dom';
import { VersionRouteParams } from '../../../../constants/routes';
import { useForm } from 'react-hook-form';
import moment, { Moment } from 'moment';

const GetMetricsQuery = loader(
  '../../../../graphql/queries/getMetrics.graphql'
);

type FormData = {
  startDate: Moment;
  endDate: Moment;
};

const DEFAULT_DATES: FormData = {
  startDate: moment()
    .subtract(30, 'days')
    .startOf('day'),
  endDate: moment().endOf('day')
};

type Props = {
  runtime?: GetVersionConfStatus_runtime;
  version?: GetVersionConfStatus_versions;
};

function Metrics({ runtime, version }: Props) {
  const { versionId, runtimeId } = useParams<VersionRouteParams>();
  const { data, loading, error, refetch } = useQuery<
    GetMetrics,
    GetMetricsVariables
  >(GetMetricsQuery, {
    variables: {
      versionId,
      runtimeId,
      startDate: DEFAULT_DATES.startDate.toISOString(),
      endDate: DEFAULT_DATES.endDate.toISOString()
    }
  });

  const { register, watch, setValue, handleSubmit } = useForm<FormData>({
    defaultValues: {
      startDate: DEFAULT_DATES.startDate,
      endDate: DEFAULT_DATES.endDate
    }
  });

  const [expanded, setExpanded] = useState<string>('');
  function toggleExpanded(nodeId: string): void {
    setExpanded(expanded ? '' : nodeId);
  }

  useEffect(() => {
    register({ name: 'startDate' });
    register({ name: 'endDate' });
  }, [register]);

  const summit = useCallback(() => {
    handleSubmit(({ startDate, endDate }: FormData) => {
      refetch({
        runtimeId,
        versionId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
    })();
  }, [handleSubmit, refetch, runtimeId, versionId]);

  // Submits the form every time 'endDate' is updated
  const endDate = watch('endDate');
  useEffect(() => {
    if (endDate) summit();
  }, [endDate, summit]);

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (error || !data) return <ErrorMessage />;
    if (data && data.metrics === null)
      return <Message text="There is no data for the selected dates" />;

    return (
      <Charts data={data} expanded={expanded} toggleExpanded={toggleExpanded} />
    );
  }

  return (
    <div className={styles.container}>
      <DashboardTitle
        runtimeName={runtime && runtime.name}
        versionName={version && version.name}
        value={watch}
        onChange={setValue}
        summit={summit}
      />
      {getContent()}
    </div>
  );
}

export default Metrics;
